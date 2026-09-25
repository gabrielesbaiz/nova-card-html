<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Tests\Fixtures\LegacyStyleCard;
use Illuminate\Support\HtmlString;
use Laravel\Nova\Http\Requests\NovaRequest;

it('renders raw html', function () {
    expect(NovaCardHtml::make()->html('<b>hi</b>')->renderContent())->toBe('<b>hi</b>');
});

it('renders an Htmlable', function () {
    expect(NovaCardHtml::make()->html(new HtmlString('<i>hi</i>'))->renderContent())->toBe('<i>hi</i>');
});

it('renders a closure and injects the card', function () {
    $html = NovaCardHtml::make()->html(fn ($card) => '<b>'.$card->title.'</b>')->title('Hi')->renderContent();

    expect($html)->toBe('<b>Hi</b>');
});

it('resolves closures through the container so they can type-hint NovaRequest', function () {
    $html = NovaCardHtml::make()
        ->html(fn (NovaRequest $request) => '<b>'.$request->query('who', 'nobody').'</b>')
        ->renderContent();

    expect($html)->toBe('<b>nobody</b>');
});

it('escapes text content', function () {
    expect(NovaCardHtml::make()->text('<script>alert(1)</script>')->renderContent())
        ->toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

it('renders markdown', function () {
    $html = NovaCardHtml::make()->markdown("# Title\n\nSome *text*.")->renderContent();

    expect($html)->toContain('<h1>Title</h1>')->toContain('<em>text</em>');
});

it('strips embedded html from markdown unless the card trusts it', function () {
    expect(NovaCardHtml::make()->markdown('<script>alert(1)</script>')->renderContent())
        ->not->toContain('<script>');

    expect(NovaCardHtml::make()->trustHtml()->markdown('<b>ok</b>')->renderContent())
        ->toContain('<b>ok</b>');
});

it('renders a blade view with extra data', function () {
    $dir = sys_get_temp_dir().'/nova-card-html-views';
    @mkdir($dir);
    file_put_contents($dir.'/demo.blade.php', '<p>{{ $name }}/{{ $extraData["k"] }}</p>');
    view()->addLocation($dir);

    $html = NovaCardHtml::make()->extraData(['k' => 'v'])->view('demo', ['name' => 'n'])->renderContent();

    expect($html)->toBe('<p>n/v</p>');
});

it('falls back to the content() hook when no fluent source was set', function () {
    expect((new LegacyStyleCard)->renderContent())->toContain('<table>');
});

it('lets a fluent source override the content() hook', function () {
    expect((new LegacyStyleCard)->html('<p>override</p>')->renderContent())->toBe('<p>override</p>');
});

it('aliases escape() to text()', function () {
    expect(NovaCardHtml::make()->escape('a & b')->renderContent())->toBe('a &amp; b');
});
