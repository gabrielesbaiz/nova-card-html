<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Tests\Fixtures;

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

class RequiredArgCard extends NovaCardHtml
{
    public function __construct(private string $message)
    {
        parent::__construct();
    }

    public function content(): string
    {
        return '<p>'.$this->message.'</p>';
    }
}
