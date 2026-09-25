<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Illuminate\Support\Facades\File;

it('generates a card that extends NovaCardHtml', function () {
    $path = app_path('Nova/Cards/DemoHtmlCard.php');

    File::delete($path);

    $this->artisan('nova-card-html', ['name' => 'DemoHtmlCard'])->assertSuccessful();

    expect(File::exists($path))->toBeTrue();

    $generated = File::get($path);

    // Regression: the stub previously extended the deleted CardHtml class,
    // so every generated card fatalled on load.
    expect($generated)
        ->toContain('use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;')
        ->toContain('extends NovaCardHtml')
        ->not->toContain('NovaCardHtml\CardHtml')
        ->not->toContain('extends CardHtml');

    // And it must be syntactically valid PHP.
    $lint = [];
    exec('php -l '.escapeshellarg($path).' 2>&1', $lint, $status);
    expect($status)->toBe(0, implode(PHP_EOL, $lint));

    File::delete($path);
});

it('substitutes the humanized card title into the stub', function () {
    $path = app_path('Nova/Cards/MyHtmlCard.php');

    File::delete($path);

    $this->artisan('nova-card-html', ['name' => 'MyHtmlCard'])->assertSuccessful();

    expect(File::get($path))
        ->toContain("public string \$title = 'My Html Card';")
        ->not->toContain('card-title')
        ->not->toContain('uri-key');

    File::delete($path);
});

it('leaves no reference to the removed CardHtml class anywhere in src', function () {
    $hits = [];
    exec('grep -rn "CardHtml" '.escapeshellarg(dirname(__DIR__).'/src').' | grep -v NovaCardHtml || true', $hits);

    expect($hits)->toBeEmpty(implode(PHP_EOL, $hits));

    expect(class_exists(NovaCardHtml::class))->toBeTrue();
});
