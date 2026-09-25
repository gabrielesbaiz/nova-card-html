<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use SplFileInfo;

class UpgradeCommand extends Command
{
    protected $signature = 'nova-card-html:upgrade
                            {--path=app : Directory to scan for NovaCardHtml subclasses}
                            {--dry-run : Report what would change without writing}';

    protected $description = 'Migrate NovaCardHtml subclasses to the v3 defaults and report migration candidates';

    /**
     * Property declarations that now merely restate a v3 default, as raw
     * (undelimited) regex bodies matching a single property line.
     *
     * @var list<string>
     */
    protected array $redundant = [
        'public bool \\$center = false;',
        'public \\$height = \'dynamic\';',
        'public string \\$title = \'\';',
    ];

    public function handle(): int
    {
        $path = base_path((string) $this->option('path'));

        if (! File::isDirectory($path)) {
            $this->components->error("Directory [{$path}] does not exist.");

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        $cards = $this->findCards($path);

        if ($cards === []) {
            $this->components->warn('No NovaCardHtml subclasses found.');

            return self::SUCCESS;
        }

        $this->components->info(sprintf('Found %d NovaCardHtml subclass(es).', count($cards)));

        $changed = 0;
        $removedLines = 0;
        $reports = ['styles' => [], 'dark' => [], 'polling' => [], 'state' => []];

        foreach ($cards as $file) {
            $original = File::get($file);
            $updated = $this->rewrite($original);

            if ($updated !== $original) {
                $changed++;
                $removedLines += substr_count($original, "\n") - substr_count($updated, "\n");

                if (! $dryRun) {
                    File::put($file, $updated);
                }
            }

            $this->collectReports($file, $original, $reports);
        }

        $this->newLine();
        $this->components->twoColumnDetail('Files rewritten', (string) $changed);
        $this->components->twoColumnDetail('Redundant lines removed', (string) $removedLines);

        $this->report('Inline <style> blocks — migrate to ->styles()', $reports['styles']);
        $this->report('Hand-written dark mode CSS — the package now ships dark mode', $reports['dark']);
        $this->report('Hand-rolled polling — migrate to ->refreshEvery()', $reports['polling']);
        $this->report('Fluent state without #[LazyState] — blocks ->lazy()', $reports['state']);

        if ($dryRun) {
            $this->newLine();
            $this->components->warn('Dry run: no files were written.');
        }

        return self::SUCCESS;
    }

    /**
     * @return list<string>
     */
    protected function findCards(string $path): array
    {
        $cards = [];

        foreach (File::allFiles($path) as $file) {
            if (! $file instanceof SplFileInfo || $file->getExtension() !== 'php') {
                continue;
            }

            $contents = File::get($file->getPathname());

            if (str_contains($contents, 'extends NovaCardHtml')) {
                $cards[] = $file->getPathname();
            }
        }

        return $cards;
    }

    protected function rewrite(string $contents): string
    {
        foreach ($this->redundant as $declaration) {
            // Matches an optional leading docblock, the indented property line,
            // and the blank line that follows it.
            $pattern = '/(?:[ \t]*\/\*\*(?:(?!\*\/)[\s\S])*?\*\/\r?\n)?'
                .'[ \t]*'.$declaration.'\r?\n(?:[ \t]*\r?\n)?/';

            $contents = preg_replace($pattern, '', $contents) ?? $contents;
        }

        // A card that explicitly wanted centering must keep it under the new default.
        return str_replace(
            'public bool $center = true;',
            "public string \$align = 'center';",
            $contents,
        );
    }

    /**
     * @param  array{styles: list<string>, dark: list<string>, polling: list<string>, state: list<string>}  $reports
     */
    protected function collectReports(string $file, string $contents, array &$reports): void
    {
        $relative = str_replace(base_path().'/', '', $file);

        if (str_contains($contents, '<style>')) {
            $reports['styles'][] = $relative;
        }

        if (str_contains($contents, '.dark ') || str_contains($contents, 'dark:')) {
            $reports['dark'][] = $relative;
        }

        if (preg_match('/setInterval|setTimeout|location\.reload|Nova\.request|fetch\(/', $contents) === 1) {
            $reports['polling'][] = $relative;
        }

        if (preg_match('/public function for[A-Z]\w*\([^)]*\): static/', $contents) === 1
            && ! str_contains($contents, '#[LazyState]')) {
            $reports['state'][] = $relative;
        }
    }

    /**
     * @param  list<string>  $files
     */
    protected function report(string $heading, array $files): void
    {
        if ($files === []) {
            return;
        }

        $this->newLine();
        $this->components->twoColumnDetail("<comment>{$heading}</comment>", (string) count($files));

        foreach (array_slice($files, 0, 10) as $file) {
            $this->line("  <fg=gray>{$file}</>");
        }

        if (count($files) > 10) {
            $this->line(sprintf('  <fg=gray>… and %d more</>', count($files) - 10));
        }
    }
}
