<?php

declare(strict_types=1);

use Gabrielesbaiz\NovaCardHtml\Http\Controllers\LazyCardController;
use Illuminate\Support\Facades\Route;

/*
 * Registered inside Nova's own middleware group, so Nova authentication and
 * the viewNova gate already apply before the controller runs.
 *
 * GET rather than POST: the dashboard's query string is forwarded verbatim so
 * that cards reading request parameters inside content() behave identically
 * whether they were rendered eagerly or lazily.
 */
Route::get('/content', LazyCardController::class)->name('content');
