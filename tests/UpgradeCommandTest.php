<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

function writeCard(string $name, string $body): string
{
    $dir = base_path('app/Nova/Cards');
    File::ensureDirectoryExists($dir);
    $path = $dir.'/'.$name.'.php';
    File::put($path, $body);

    return $path;
}

beforeEach(function () {
    File::deleteDirectory(base_path('app/Nova/Cards'));
});

afterEach(function () {
    File::deleteDirectory(base_path('app/Nova/Cards'));
});

it('removes property declarations that only restate the v3 defaults', function () {
    // Exactly the shape used by all 158 NovaCardHtml subclasses in the wild.
    $path = writeCard('Demo', <<<'PHP'
        <?php

        namespace App\Nova\Cards;

        use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

        class Demo extends NovaCardHtml
        {
            public $width = 'full';

            public $height = 'dynamic';

            public bool $center = false;

            public function content(): string
            {
                return '<p>hi</p>';
            }
        }
        PHP);

    $this->artisan('nova-card-html:upgrade', ['--path' => 'app'])->assertSuccessful();

    $updated = File::get($path);

    expect($updated)
        ->not->toContain('$height')
        ->not->toContain('$center')
        ->toContain("public \$width = 'full';")
        ->toContain('public function content(): string');

    // Still valid PHP after rewriting.
    exec('php -l '.escapeshellarg($path).' 2>&1', $out, $status);
    expect($status)->toBe(0, implode(PHP_EOL, $out));
});

it('preserves centering for cards that explicitly wanted it', function () {
    $path = writeCard('Centered', <<<'PHP'
        <?php

        namespace App\Nova\Cards;

        use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

        class Centered extends NovaCardHtml
        {
            public bool $center = true;
        }
        PHP);

    $this->artisan('nova-card-html:upgrade', ['--path' => 'app'])->assertSuccessful();

    expect(File::get($path))->toContain("public string \$align = 'center';");
});

it('writes nothing during a dry run', function () {
    $body = <<<'PHP'
        <?php

        namespace App\Nova\Cards;

        use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

        class Demo extends NovaCardHtml
        {
            public bool $center = false;
        }
        PHP;

    $path = writeCard('Demo', $body);

    $this->artisan('nova-card-html:upgrade', ['--path' => 'app', '--dry-run' => true])
        ->expectsOutputToContain('Dry run')
        ->assertSuccessful();

    expect(File::get($path))->toBe($body);
});

it('reports migration candidates without editing them', function () {
    writeCard('Live', <<<'PHP'
        <?php

        namespace App\Nova\Cards;

        use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;

        class Live extends NovaCardHtml
        {
            public function forYear(int $year): static
            {
                return $this;
            }

            public function content(): string
            {
                return '<style>.dark .x { color: red }</style><script>setInterval(f, 1000)</script>';
            }
        }
        PHP);

    $this->artisan('nova-card-html:upgrade', ['--path' => 'app', '--dry-run' => true])
        ->expectsOutputToContain('->styles()')
        ->expectsOutputToContain('->refreshEvery()')
        ->expectsOutputToContain('#[LazyState]')
        ->assertSuccessful();
});

it('warns when there is nothing to upgrade', function () {
    File::ensureDirectoryExists(base_path('app/Nova/Cards'));

    $this->artisan('nova-card-html:upgrade', ['--path' => 'app'])
        ->expectsOutputToContain('No NovaCardHtml subclasses found')
        ->assertSuccessful();
});
