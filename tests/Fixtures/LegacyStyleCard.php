<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Tests\Fixtures;

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

/**
 * Mirrors the exact shape used by all 158 NovaCardHtml subclasses in NoviasSource:
 * full width, dynamic height, centering disabled, a no-arg constructor calling
 * parent::__construct() with no arguments, and a fluent forYear() setter.
 */
class LegacyStyleCard extends NovaCardHtml
{
    public string $title = '';

    public $width = 'full';

    public $height = 'dynamic';

    public bool $center = false;

    protected int $year;

    public function __construct()
    {
        parent::__construct();

        $this->year = 2026;
    }

    public function forYear(int $year): static
    {
        $this->year = $year;

        return $this;
    }

    public function content(): string
    {
        return '<table><tr><td>'.$this->year.'</td></tr></table>';
    }
}
