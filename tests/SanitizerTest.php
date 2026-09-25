<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer;
use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Support\AllowListSanitizer;

it('passes html through untouched by default', function () {
    $html = '<div onclick="steal()">hi</div>';

    expect(NovaCardHtml::make()->html($html)->renderContent())->toBe($html);
});

it('strips scripts and event handlers when sanitizing', function () {
    $html = NovaCardHtml::make()
        ->html('<div onclick="steal()"><script>alert(1)</script><b>safe</b></div>')
        ->sanitize()
        ->renderContent();

    expect($html)->toContain('<b>safe</b>')
        ->not->toContain('onclick')
        ->not->toContain('<script>')
        ->not->toContain('alert(1)');
});

it('strips javascript urls', function () {
    $html = (new AllowListSanitizer)->sanitize('<a href="javascript:alert(1)">x</a>');

    expect($html)->not->toContain('javascript:');
});

it('keeps table markup, which cards rely on heavily', function () {
    $table = '<table class="w-full"><thead><tr><th scope="col">Year</th></tr></thead>'
        .'<tbody><tr><td colspan="2">1</td></tr></tbody></table>';

    expect((new AllowListSanitizer)->sanitize($table))
        ->toContain('<table class="w-full">')
        ->toContain('scope="col"')
        ->toContain('colspan="2"');
});

it('unwraps disallowed tags but keeps their allowed content', function () {
    expect((new AllowListSanitizer)->sanitize('<marquee><b>keep</b></marquee>'))
        ->toBe('<b>keep</b>');
});

it('can be enabled globally by config', function () {
    config()->set('nova-card-html.sanitize', true);

    expect(NovaCardHtml::make()->html('<script>x</script><p>ok</p>')->renderContent())
        ->not->toContain('<script>');
});

it('lets trustHtml opt out of a global sanitize default', function () {
    config()->set('nova-card-html.sanitize', true);

    expect(NovaCardHtml::make()->html('<b onclick="x">ok</b>')->trustHtml()->renderContent())
        ->toContain('onclick');
});

it('accepts a sanitizer of your own', function () {
    $card = NovaCardHtml::make()->html('<p>a</p><i>b</i>')->sanitize(true, new class implements HtmlSanitizer
    {
        public function sanitize(string $html): string
        {
            return strip_tags($html, '<p><b>');
        }
    });

    expect($card->renderContent())->toBe('<p>a</p>b');
});
