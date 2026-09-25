<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Tests\Fixtures;

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Illuminate\Http\Request;

/**
 * A card that denies itself. Authorization lives on the class rather than on a
 * canSee() closure because a lazily fetched card is rebuilt from scratch: only
 * class-level rules survive the round trip, which is exactly why the controller
 * must re-evaluate them instead of trusting the token.
 */
class UnauthorizedCard extends NovaCardHtml
{
    public function authorize(Request $request)
    {
        return false;
    }

    public function content(): string
    {
        return '<p>secret</p>';
    }
}
