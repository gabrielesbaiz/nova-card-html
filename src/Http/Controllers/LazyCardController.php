<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Http\Controllers;

use Gabrielesbaiz\NovaCardHtml\Exceptions\LazyCardException;
use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Gabrielesbaiz\NovaCardHtml\Support\LazyToken;
use Illuminate\Http\JsonResponse;
use Laravel\Nova\Http\Requests\NovaRequest;

class LazyCardController
{
    public function __invoke(NovaRequest $request): JsonResponse
    {
        $token = $request->query('token');

        if (! is_string($token) || $token === '') {
            return response()->json(['message' => 'Missing lazy card token.'], 422);
        }

        try {
            ['card' => $class, 'state' => $state] = LazyToken::decode($token);
        } catch (LazyCardException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        /** @var NovaCardHtml $card */
        $card = new $class;

        $card = $card->fromLazyState($state);

        // A decryptable token proves provenance, never permission: re-run the
        // card's own authorization against the current user on every fetch.
        if (! $card->authorize($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['content' => $card->renderContent()]);
    }
}
