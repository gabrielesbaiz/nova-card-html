<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\Exceptions\LazyCardException;
use Gabrielesbaiz\NovaCardHtml\Support\LazyToken;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LazyYearCard;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\RequiredArgCard;
use Illuminate\Support\Facades\Crypt;

it('omits content and emits a token when lazy', function () {
    $payload = (new LazyYearCard)->forYear(2024)->lazy()->jsonSerialize();

    expect($payload['content'])->toBeNull()
        ->and($payload['lazy'])->toBeTrue()
        ->and($payload['lazyToken'])->toBeString()
        ->and($payload['lazyEndpoint'])->toContain('nova-vendor/nova-card-html/content');
});

it('still renders content inline when not lazy', function () {
    expect((new LazyYearCard)->forYear(2024)->jsonSerialize()['content'])->toContain('2024');
});

it('round-trips #[LazyState] properties through the token', function () {
    $token = (new LazyYearCard)->forYear(2019)->lazy()->jsonSerialize()['lazyToken'];

    ['card' => $class, 'state' => $state] = LazyToken::decode($token);

    expect($class)->toBe(LazyYearCard::class)
        ->and($state)->toBe(['year' => 2019]);

    expect((new LazyYearCard)->fromLazyState($state)->renderContent())->toContain('2019');
});

it('refuses to make a card with required constructor arguments lazy', function () {
    (new RequiredArgCard('x'))->lazy();
})->throws(LazyCardException::class, 'must therefore be constructible with no arguments');

it('rejects a token pointing at a class that is not a card', function () {
    $token = Crypt::encrypt(['card' => Illuminate\Support\Str::class, 'state' => []]);

    expect(fn () => LazyToken::decode($token))->toThrow(LazyCardException::class);
});

it('rejects a tampered token', function () {
    expect(fn () => LazyToken::decode('not-a-real-token'))->toThrow(LazyCardException::class);
});

it('implies lazy for refreshEvery and deferUntilVisible', function () {
    expect((new LazyYearCard)->refreshEvery(10)->isLazy())->toBeTrue()
        ->and((new LazyYearCard)->deferUntilVisible()->isLazy())->toBeTrue();

    $payload = (new LazyYearCard)->refreshEvery(10)->jsonSerialize();

    expect($payload['refreshEvery'])->toBe(10);
});
