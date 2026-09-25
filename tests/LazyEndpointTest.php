<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\Support\LazyToken;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LazyYearCard;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\UnauthorizedCard;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Gate;
use Laravel\Nova\Nova;

beforeEach(function () {
    // Nova's middleware group guards the route; allow access for these tests.
    Gate::define('viewNova', fn () => true);
    Nova::auth(fn () => true);
});

function lazyUrl(string $token, array $query = []): string
{
    return '/nova-vendor/nova-card-html/content?'.http_build_query(array_merge(['token' => $token], $query));
}

it('returns the rendered content for a valid token', function () {
    $token = LazyToken::encode(LazyYearCard::class, ['year' => 2021]);

    $this->getJson(lazyUrl($token))
        ->assertOk()
        ->assertJsonPath('content', '<p>2021/none</p>');
});

it('forwards the dashboard query string into content()', function () {
    // Regression: cards reading request parameters must behave the same whether
    // they were rendered eagerly or fetched lazily.
    $token = LazyToken::encode(LazyYearCard::class, ['year' => 2021]);

    $this->getJson(lazyUrl($token, ['window' => '240']))
        ->assertOk()
        ->assertJsonPath('content', '<p>2021/240</p>');
});

it('rejects a missing token', function () {
    $this->getJson('/nova-vendor/nova-card-html/content')->assertStatus(422);
});

it('rejects a tampered token', function () {
    $this->getJson(lazyUrl('garbage'))->assertStatus(422);
});

it('rejects a token pointing at a class that is not a card', function () {
    $token = Crypt::encrypt(['card' => Illuminate\Support\Str::class, 'state' => []]);

    $this->getJson(lazyUrl($token))->assertStatus(422);
});

it('re-runs card authorization on every fetch', function () {
    // A decryptable token proves provenance, never permission.
    $token = LazyToken::encode(UnauthorizedCard::class, []);

    $this->getJson(lazyUrl($token))->assertStatus(403);
});
