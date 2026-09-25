<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Tests\Fixtures;

use Gabrielesbaiz\NovaCardHtml\Attributes\LazyState;
use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Illuminate\Support\Facades\Request;

/**
 * Mirrors the a year-scoped monitoring card shape: a no-arg constructor plus a
 * forYear() fluent setter whose value must survive a lazy round trip.
 */
class LazyYearCard extends NovaCardHtml
{
    public $width = 'full';

    #[LazyState]
    protected int $year = 2026;

    public function forYear(int $year): static
    {
        $this->year = $year;

        return $this;
    }

    public function content(): string
    {
        // Reads the request the same way LiveUsersHeroCard::resolveWindow() does.
        $window = Request::query('window', 'none');

        return '<p>'.$this->year.'/'.$window.'</p>';
    }
}
