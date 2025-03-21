<?php

namespace Gabrielesbaiz\NovaCardHtml;

use Laravel\Nova\Card;

class CardHtml extends Card
{
    public string $title = '';

    public string $content = '';

    public $width = '1/3';

    public $height = 'fixed';

    public bool $center = true;

    public function __construct()
    {
        parent::__construct('card-html');

        if (request()->is('nova-api/metrics/*')) {
            return;
        }
    }

    public function content(): string
    {
        return '';
    }

    public function extraData(array $extraData)
    {
        return $this->withMeta(['extraData' => $extraData]);
    }

    public function jsonSerialize(): array
    {
        return array_merge([
            'title' => $this->title,
            'content' => $this->content(),
            'height' => $this->height,
            'center' => $this->center,
        ], parent::jsonSerialize());
    }
}
