<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LegacyStyleCard;

it('defaults to dynamic height and left alignment', function () {
    // The v3 default flip: every real-world card overrode the old
    // fixed/centered defaults, so they served nobody.
    $payload = NovaCardHtml::make()->jsonSerialize();

    expect($payload['height'])->toBe('dynamic')
        ->and($payload['align'])->toBe('left')
        ->and($payload['center'])->toBeFalse();
});

it('honours the legacy $center property when align was never called', function () {
    $card = new class extends NovaCardHtml
    {
        public bool $center = true;
    };

    expect($card->jsonSerialize()['align'])->toBe('center');
});

it('lets align() win over the legacy $center property', function () {
    $card = new class extends NovaCardHtml
    {
        public bool $center = true;
    };

    expect($card->align('right')->jsonSerialize()['align'])->toBe('right');
});

it('keeps $center = false cards left aligned', function () {
    expect((new LegacyStyleCard)->jsonSerialize()['align'])->toBe('left');
});

it('treats an integer height as a pixel cap and switches to fixed', function () {
    $payload = NovaCardHtml::make()->height(240)->jsonSerialize();

    expect($payload['height'])->toBe('fixed')
        ->and($payload['maxHeight'])->toBe(240);
});

it('still accepts a string height like Nova does', function () {
    expect(NovaCardHtml::make()->height('fixed')->jsonSerialize()['height'])->toBe('fixed');
});

it('serializes the presentation options', function () {
    $payload = NovaCardHtml::make('T')
        ->icon('document-text')
        ->theme('info')
        ->withoutCardStyles()
        ->collapsible(true)
        ->styles('.x { color: red }')
        ->header('<b>h</b>')
        ->footer('<b>f</b>')
        ->jsonSerialize();

    expect($payload['title'])->toBe('T')
        ->and($payload['icon'])->toBe('document-text')
        ->and($payload['theme'])->toBe('info')
        ->and($payload['cardStyles'])->toBeFalse()
        ->and($payload['collapsible'])->toBeTrue()
        ->and($payload['collapsedByDefault'])->toBeTrue()
        ->and($payload['styles'])->toBe('.x { color: red }')
        ->and($payload['header'])->toBe('<b>h</b>')
        ->and($payload['footer'])->toBe('<b>f</b>');
});

it('marks center() as deprecated but keeps it working', function () {
    $card = NovaCardHtml::make();

    $deprecations = [];
    set_error_handler(function (int $level, string $message) use (&$deprecations): bool {
        $deprecations[] = $message;

        return true;
    }, E_USER_DEPRECATED);

    $card->center();

    restore_error_handler();

    expect($deprecations)->toHaveCount(1)
        ->and($card->jsonSerialize()['align'])->toBe('center');
});

it('applies configured defaults to cards that did not declare their own', function () {
    config()->set('nova-card-html.defaults', [
        'width' => 'full',
        'height' => 'fixed',
        'align' => 'center',
    ]);

    $payload = NovaCardHtml::make()->jsonSerialize();

    expect($payload['width'])->toBe('full')
        ->and($payload['height'])->toBe('fixed')
        ->and($payload['align'])->toBe('center');
});

it('never overrides a value the subclass declared itself', function () {
    config()->set('nova-card-html.defaults', ['width' => 'full', 'height' => 'fixed']);

    $card = new class extends NovaCardHtml
    {
        public $width = '1/2';
    };

    expect($card->jsonSerialize()['width'])->toBe('1/2')
        ->and($card->jsonSerialize()['height'])->toBe('fixed');
});

it('lets Nova force a dynamic height for full-width cards', function () {
    // Nova's own Card::width() sets height to dynamic when the card is full
    // width. Ported here when the README stopped carrying executable samples.
    expect(NovaCardHtml::make()->height('fixed')->width('full')->jsonSerialize()['height'])
        ->toBe('dynamic');
});
