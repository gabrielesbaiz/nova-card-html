<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LazyYearCard;
use Illuminate\Support\Facades\Cache;

it('does not cache by default', function () {
    $calls = 0;

    $card = NovaCardHtml::make()->html(function () use (&$calls) {
        $calls++;

        return '<p>'.$calls.'</p>';
    });

    $card->renderContent();
    $card->renderContent();

    expect($calls)->toBe(2);
});

it('caches the rendered html when a ttl is given', function () {
    $calls = 0;

    $card = NovaCardHtml::make()->html(function () use (&$calls) {
        $calls++;

        return '<p>'.$calls.'</p>';
    })->cache(60);

    expect($card->renderContent())->toBe('<p>1</p>')
        ->and($card->renderContent())->toBe('<p>1</p>')
        ->and($calls)->toBe(1);
});

it('honours a custom cache key', function () {
    NovaCardHtml::make()->html('<p>a</p>')->cache(60, 'my-key')->renderContent();

    expect(Cache::get('my-key'))->toBe('<p>a</p>');
});

it('keys the default cache entry on the lazy state', function () {
    // Regression: a card parameterised with forYear() must not serve another
    // year's HTML from cache.
    $a = (new LazyYearCard)->forYear(2020)->cache(60);
    $b = (new LazyYearCard)->forYear(2021)->cache(60);

    expect($a->cacheKey())->not->toBe($b->cacheKey())
        ->and($a->renderContent())->toContain('2020')
        ->and($b->renderContent())->toContain('2021');
});
