<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Support;

use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMNode;
use Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer;

/**
 * A dependency-free allow-list sanitizer.
 *
 * This is deliberately conservative: anything not explicitly allowed is
 * removed. It exists so that ->sanitize() works out of the box; installing
 * mews/purifier swaps in PurifierSanitizer for a far more thorough pass.
 */
class AllowListSanitizer implements HtmlSanitizer
{
    /**
     * @param  list<string>  $allowedTags
     * @param  array<string, list<string>>  $allowedAttributes  Tag name (or '*') => attributes.
     */
    public function __construct(
        protected array $allowedTags = [],
        protected array $allowedAttributes = [],
    ) {
        $this->allowedTags = $allowedTags !== [] ? $allowedTags : self::defaultTags();
        $this->allowedAttributes = $allowedAttributes !== [] ? $allowedAttributes : self::defaultAttributes();
    }

    /**
     * @return list<string>
     */
    public static function defaultTags(): array
    {
        return [
            'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'col', 'colgroup',
            'dd', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3',
            'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'small',
            'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
            'thead', 'tr', 'u', 'ul',
        ];
    }

    /**
     * @return array<string, list<string>>
     */
    public static function defaultAttributes(): array
    {
        return [
            '*' => ['class', 'id', 'style', 'title', 'dir', 'lang'],
            'a' => ['href', 'target', 'rel'],
            'img' => ['src', 'alt', 'width', 'height', 'loading'],
            'td' => ['colspan', 'rowspan', 'scope'],
            'th' => ['colspan', 'rowspan', 'scope'],
            'col' => ['span'],
            'colgroup' => ['span'],
            'ol' => ['start', 'type'],
        ];
    }

    public function sanitize(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $document = new DOMDocument;

        $previous = libxml_use_internal_errors(true);

        // The wrapper keeps DOMDocument from promoting the fragment to a full
        // document, and the XML encoding declaration keeps UTF-8 intact.
        $document->loadHTML(
            '<?xml encoding="UTF-8"?><div id="nova-card-html-root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('nova-card-html-root');

        if (! $root instanceof DOMElement) {
            return '';
        }

        $this->cleanChildren($root);

        $output = '';

        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        return $output;
    }

    protected function cleanChildren(DOMNode $node): void
    {
        // Snapshot first: removing nodes while iterating a live DOMNodeList skips siblings.
        $children = iterator_to_array($node->childNodes);

        foreach ($children as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }

            $tag = strtolower($child->nodeName);

            if (! in_array($tag, $this->allowedTags, true)) {
                // Drop the element but keep any allowed content it wrapped, except
                // for elements whose content is executable or stylistic payload.
                if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'template'], true)) {
                    $node->removeChild($child);

                    continue;
                }

                $this->cleanChildren($child);

                while ($child->firstChild !== null) {
                    $node->insertBefore($child->firstChild, $child);
                }

                $node->removeChild($child);

                continue;
            }

            $this->cleanAttributes($child, $tag);

            $this->cleanChildren($child);
        }
    }

    protected function cleanAttributes(DOMElement $element, string $tag): void
    {
        $allowed = array_merge(
            $this->allowedAttributes['*'] ?? [],
            $this->allowedAttributes[$tag] ?? [],
        );

        /** @var list<DOMAttr> $attributes */
        $attributes = iterator_to_array($element->attributes);

        foreach ($attributes as $attribute) {
            $name = strtolower($attribute->nodeName);

            // Every on* handler is script, regardless of the allow list.
            if (! in_array($name, $allowed, true) || str_starts_with($name, 'on')) {
                $element->removeAttribute($attribute->nodeName);

                continue;
            }

            if (in_array($name, ['href', 'src'], true) && $this->isDangerousUrl($attribute->nodeValue ?? '')) {
                $element->removeAttribute($attribute->nodeName);
            }
        }
    }

    protected function isDangerousUrl(string $url): bool
    {
        $normalised = strtolower(preg_replace('/\s+/', '', $url) ?? '');

        return str_starts_with($normalised, 'javascript:')
            || str_starts_with($normalised, 'vbscript:')
            || str_starts_with($normalised, 'data:text/html');
    }
}
