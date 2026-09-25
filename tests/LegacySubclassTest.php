<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LegacyStyleCard;

it('keeps the no-argument parent constructor working', function () {
    $card = new LegacyStyleCard;

    expect($card->component())->toBe('nova-card-html');
});

it('still accepts a custom component name like Nova\'s Element', function () {
    $card = new NovaCardHtml('custom-component');

    expect($card->component())->toBe('custom-component');
});

it('serializes the legacy subclass shape', function () {
    $payload = (new LegacyStyleCard)->forYear(2024)->jsonSerialize();

    expect($payload)
        ->toHaveKeys(['component', 'title', 'content', 'height', 'center', 'width'])
        ->and($payload['component'])->toBe('nova-card-html')
        ->and($payload['width'])->toBe('full')
        ->and($payload['height'])->toBe('dynamic')
        ->and($payload['center'])->toBeFalse()
        ->and($payload['content'])->toBe('<table><tr><td>2024</td></tr></table>');
});

it('lets the card own its keys instead of the parent overriding them', function () {
    // Regression: jsonSerialize() previously merged parent LAST, letting Nova's
    // Card::jsonSerialize() silently win on any shared key.
    $card = new LegacyStyleCard;

    $ownKeys = ['title', 'content', 'height', 'center'];

    $payload = $card->jsonSerialize();

    foreach ($ownKeys as $key) {
        expect($payload)->toHaveKey($key);
    }

    expect($payload['height'])->toBe($card->height);
});

it('exposes extraData through meta and is chainable', function () {
    $card = (new LegacyStyleCard)->extraData(['foo' => 'bar']);

    expect($card)->toBeInstanceOf(LegacyStyleCard::class)
        ->and($card->jsonSerialize())->toHaveKey('extraData')
        ->and($card->jsonSerialize()['extraData'])->toBe(['foo' => 'bar']);
});

it('no longer declares a dead $content property', function () {
    expect(property_exists(NovaCardHtml::class, 'content'))->toBeFalse();
});

it('serializes an upgraded card identically to the original', function () {
    // The acceptance gate for nova-card-html:upgrade: stripping the property
    // declarations that now only restate the v3 defaults must be a no-op.
    $original = new class extends NovaCardHtml
    {
        public string $title = '';

        public $width = 'full';

        public $height = 'dynamic';

        public bool $center = false;

        public function content(): string
        {
            return '<p>x</p>';
        }
    };

    $upgraded = new class extends NovaCardHtml
    {
        public $width = 'full';

        public function content(): string
        {
            return '<p>x</p>';
        }
    };

    $strip = fn (array $p): array => collect($p)->except(['lazyToken'])->all();

    expect($strip($upgraded->jsonSerialize()))->toBe($strip($original->jsonSerialize()));
});
