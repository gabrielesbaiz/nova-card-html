/* nova-card-html — documentation site
   One hash router over two route shapes: the landing page at #/home
   (full-width bands) and every docs page beside it (three columns). */
(function(){
"use strict";
var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var timers = [];
function later(fn,ms){ timers.push(setTimeout(fn, REDUCED ? 0 : ms)); }

/* Page content. Every fact here is quoted from the repository:
   composer.json, config/nova-card-html.php, src/, README.md, CHANGELOG.md. */
var PAGES = {

intro:{ t:"Introduction", e:"", sub:"What this is, and when to use something else.", body:`
<h2>What it is</h2>
<p class="lead">A Laravel Nova card that renders any HTML your application can produce &mdash; from a string, a Markdown document, or a Blade view &mdash; and places it on the dashboard grid like any other card.</p>
<p>It ships lazy loading, response caching, polling, dark mode and an opt-in HTML sanitizer, in <strong>4.95 kB of JavaScript and 2.23 kB of CSS</strong>, both gzipped under 2 kB, with no runtime dependency of its own.</p>

<h2>Do you need this?</h2>
<p>If you want to show <strong>a number, a trend or a breakdown</strong>, you do not need this package. Nova already has metrics, and they are better at it:</p>
<pre class="code"><span class="k">use</span> Laravel\\Nova\\Metrics\\<span class="f">Value</span>;
<span class="k">use</span> Laravel\\Nova\\Metrics\\<span class="f">Trend</span>;
<span class="k">use</span> Laravel\\Nova\\Metrics\\<span class="f">Partition</span>;</pre>
<p>They cache, they range-select, they render consistently, and you write no markup at all. If you want a <strong>bespoke interactive widget</strong> &mdash; something with its own state, forms and events &mdash; you do not need this package either. Write a real Nova card in Vue; you will end up there anyway.</p>
<p>You want this package when you have <strong>markup that already exists in PHP</strong> and no appetite for a build step:</p>
<ul>
<li>A table whose shape is not a metric &mdash; a year-by-year matrix, a funnel, a pivot with per-cell formatting.</li>
<li>Release notes, a policy, a runbook &mdash; Markdown or a Blade view you already maintain somewhere else.</li>
<li>A menu, a toolbar or a legend that sits above the real cards on a dashboard.</li>
<li>Anything you would otherwise build as a Vue card, needed by Friday.</li>
</ul>
<div class="note"><b>The trade.</b> This renders server-produced HTML through Vue's <code>v-html</code>. That is the feature, and it means <b>card content is a trust boundary</b> &mdash; the package cannot tell your markup from a user's name that ended up inside it. It gives you <code>-&gt;sanitize()</code> and gets out of the way. If your content is fully user-generated, an HTML card is the wrong shape for it.</div>

<h2>Requirements</h2>
<table class="t"><tr><th>PHP</th><th>Laravel</th><th>Nova</th><th>Licence</th></tr>
<tr><td>8.3 or newer</td><td>12 &middot; 13</td><td>5.7+ (Nova 6 conflicted)</td><td>MIT</td></tr></table>
<p>Two optional dependencies: <code>league/commonmark</code> for <code>-&gt;markdown()</code>, and <code>mews/purifier</code> to back <code>-&gt;sanitize()</code>.</p>

<h2>What you get</h2>
<table class="t"><tr><th>Group</th><th>Methods</th></tr>
<tr><td>Content</td><td><code>html()</code> <code>markdown()</code> <code>view()</code> <code>text()</code> <code>escape()</code> <code>content()</code> <code>extraData()</code></td></tr>
<tr><td>Presentation</td><td><code>title()</code> <code>icon()</code> <code>theme()</code> <code>width()</code> <code>height()</code> <code>align()</code> <code>styles()</code> <code>header()</code> <code>footer()</code> <code>collapsible()</code> <code>withoutCardStyles()</code></td></tr>
<tr><td>Performance</td><td><code>cache()</code> <code>lazy()</code> <code>deferUntilVisible()</code> <code>refreshEvery()</code> <code>placeholder()</code></td></tr>
<tr><td>Safety</td><td><code>sanitize()</code> <code>trustHtml()</code></td></tr></table>
`},

install:{ t:"Installation", e:"", sub:"The card works with no configuration. Publishing is optional.", body:`
<h2>Install</h2>
<pre class="code">composer require gabrielesbaiz/nova-card-html</pre>
<p>That is the whole install. The service provider is auto-discovered, and the card's assets are registered with Nova on <code>Nova::serving</code>.</p>

<h2>Publish the config</h2>
<p>Only needed to change the defaults, the sanitizer or the lazy route.</p>
<pre class="code">php artisan vendor:publish --tag=<span class="st">"nova-card-html-config"</span></pre>

<h2>Publish the translations</h2>
<p>The card renders two strings of its own &mdash; the failure message and the retry label. English and Italian ship with the package.</p>
<pre class="code">php artisan vendor:publish --tag=<span class="st">"nova-card-html-lang"</span></pre>

<h2>Generate a card</h2>
<pre class="code">php artisan nova-card-html MyHtmlCard</pre>
<p>Creates <code>app/Nova/Cards/MyHtmlCard.php</code>, with the title humanized from the class name. Pass <code>--force</code> to overwrite.</p>
<pre class="code"><span class="k">namespace</span> App\\Nova\\Cards;

<span class="k">use</span> Gabrielesbaiz\\NovaCardHtml\\<span class="f">NovaCardHtml</span>;

<span class="k">class</span> <span class="f">MyHtmlCard</span> <span class="k">extends</span> NovaCardHtml
{
    <span class="k">public</span> <span class="k">string</span> $title = <span class="st">'My Html Card'</span>;

    <span class="k">public</span> $width = <span class="st">'1/3'</span>;

    <span class="k">public function</span> <span class="f">content</span>(): <span class="k">string</span>
    {
        <span class="k">return</span> <span class="st">'&lt;h1 class="text-4xl"&gt;Some content&lt;/h1&gt;'</span>;
    }
}</pre>

<h2>Register it</h2>
<p>Exactly as any Nova card &mdash; on a resource, or on a dashboard.</p>
<pre class="code"><span class="cm">// app/Nova/Dashboards/Main.php</span>
<span class="k">public function</span> <span class="f">cards</span>(): <span class="k">array</span>
{
    <span class="k">return</span> [
        <span class="k">new</span> \\App\\Nova\\Cards\\<span class="f">MyHtmlCard</span>(),
        <span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Notes'</span>)-&gt;<span class="f">markdown</span>(<span class="st">'## Today'</span>),
    ];
}</pre>
`},

config:{ t:"Configuration", e:"", sub:"Sixteen keys, all optional.", body:`
<h2>The file</h2>
<p>Published to <code>config/nova-card-html.php</code>. Every key below has a working default; the card needs none of them set.</p>
<pre class="code"><span class="k">return</span> [
    <span class="st">'sanitize'</span> =&gt; <span class="k">false</span>,

    <span class="st">'sanitizer'</span> =&gt; [
        <span class="st">'driver'</span> =&gt; <span class="st">'auto'</span>,
        <span class="st">'purifier_config'</span> =&gt; <span class="k">null</span>,
        <span class="st">'allowed_tags'</span> =&gt; [],
        <span class="st">'allowed_attributes'</span> =&gt; [],
    ],

    <span class="st">'cache'</span> =&gt; [
        <span class="st">'store'</span> =&gt; <span class="k">null</span>,
        <span class="st">'prefix'</span> =&gt; <span class="st">'nova-card-html'</span>,
    ],

    <span class="st">'lazy'</span> =&gt; [
        <span class="st">'enabled'</span> =&gt; <span class="k">true</span>,
        <span class="st">'path'</span> =&gt; <span class="st">'nova-vendor/nova-card-html'</span>,
    ],

    <span class="st">'defaults'</span> =&gt; [
        <span class="st">'width'</span> =&gt; <span class="st">'1/3'</span>,
        <span class="st">'height'</span> =&gt; <span class="st">'dynamic'</span>,
        <span class="st">'align'</span> =&gt; <span class="st">'left'</span>,
    ],
];</pre>

<h2>Sanitizing</h2>
<table class="t"><tr><th>Key</th><th>Default</th><th>What it does</th></tr>
<tr><td><code>sanitize</code></td><td><code>false</code></td><td>Sanitize every card unless it calls <code>trustHtml()</code>.</td></tr>
<tr><td><code>sanitizer.driver</code></td><td><code>'auto'</code></td><td><code>auto</code>, <code>purifier</code> or <code>allow-list</code>. <code>auto</code> uses Purifier when installed.</td></tr>
<tr><td><code>sanitizer.purifier_config</code></td><td><code>null</code></td><td>Named HTMLPurifier config to use.</td></tr>
<tr><td><code>sanitizer.allowed_tags</code></td><td><code>[]</code></td><td>Replaces the allow list's default tags. Empty keeps them.</td></tr>
<tr><td><code>sanitizer.allowed_attributes</code></td><td><code>[]</code></td><td>Replaces the default attributes, keyed by tag or <code>*</code>.</td></tr></table>

<h2>Caching</h2>
<table class="t"><tr><th>Key</th><th>Default</th><th>What it does</th></tr>
<tr><td><code>cache.store</code></td><td><code>null</code></td><td>Cache store for <code>-&gt;cache()</code>. <code>null</code> is the application default.</td></tr>
<tr><td><code>cache.prefix</code></td><td><code>'nova-card-html'</code></td><td>Prefix for generated cache keys.</td></tr></table>

<h2>Lazy loading</h2>
<table class="t"><tr><th>Key</th><th>Default</th><th>What it does</th></tr>
<tr><td><code>lazy.enabled</code></td><td><code>true</code></td><td>Register the lazy route at all.</td></tr>
<tr><td><code>lazy.path</code></td><td><code>'nova-vendor/nova-card-html'</code></td><td>Route prefix. Always inside Nova's middleware group.</td></tr></table>

<h2>Defaults</h2>
<table class="t"><tr><th>Key</th><th>Default</th><th>What it does</th></tr>
<tr><td><code>defaults.width</code></td><td><code>'1/3'</code></td><td>Width for cards that do not declare one.</td></tr>
<tr><td><code>defaults.height</code></td><td><code>'dynamic'</code></td><td>Height for cards that do not declare one.</td></tr>
<tr><td><code>defaults.align</code></td><td><code>'left'</code></td><td>Alignment for cards that do not declare one.</td></tr></table>
<div class="note"><b>Only fills the gaps.</b> The <code>defaults</code> block applies to values a card left untouched. A card declaring <code>public $width = 'full';</code> keeps <code>full</code> whatever the config says.</div>
`},

guide:{ t:"Guide", e:"", sub:"Building a card, and the four content sources.", body:`
<h2>Subclass or fluent</h2>
<p>Both are first-class; pick per card.</p>
<p><strong>Subclass</strong> when the card has logic &mdash; queries, loops, branching. The markup lives in a method you can read, test and inject into.</p>
<pre class="code"><span class="k">class</span> <span class="f">SignupsByYear</span> <span class="k">extends</span> NovaCardHtml
{
    <span class="k">public</span> $width = <span class="st">'full'</span>;

    <span class="k">public function</span> <span class="f">content</span>(): <span class="k">string</span>
    {
        $rows = <span class="f">Signup</span>::<span class="f">countsByYear</span>()
            -&gt;<span class="f">map</span>(fn (<span class="k">int</span> $n, <span class="k">int</span> $year) =&gt; <span class="st">"&lt;tr&gt;&lt;td&gt;{$year}&lt;/td&gt;&lt;td&gt;{$n}&lt;/td&gt;&lt;/tr&gt;"</span>)
            -&gt;<span class="f">implode</span>(<span class="st">''</span>);

        <span class="k">return</span> <span class="st">"&lt;table class=\\"w-full\\"&gt;{$rows}&lt;/table&gt;"</span>;
    }
}</pre>
<p><strong>Fluent</strong> when the card is a one-liner and a whole class would be ceremony.</p>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Environment'</span>)-&gt;<span class="f">html</span>(<span class="st">'&lt;code&gt;'</span>.<span class="f">app</span>()-&gt;<span class="f">environment</span>().<span class="st">'&lt;/code&gt;'</span>);</pre>
<p>They compose. A subclass can still be configured fluently at the call site:</p>
<pre class="code">(<span class="k">new</span> <span class="f">SignupsByYear</span>())-&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addMinutes</span>(30))-&gt;<span class="f">lazy</span>();</pre>
<div class="note"><b>make() takes a title.</b> Nova's <code>Makeable::make()</code> forwards its arguments to the constructor, which for an <code>Element</code> means the component name. A title is far more useful here, so the first argument is treated as one. To override the Vue component, pass it to the constructor: <code>new NovaCardHtml('my-component')</code>.</div>

<h2>html()</h2>
<p>Raw HTML, as a string, an <code>Htmlable</code>, or a closure.</p>
<pre class="code">-&gt;<span class="f">html</span>(<span class="st">'&lt;p&gt;Hello&lt;/p&gt;'</span>)
-&gt;<span class="f">html</span>(<span class="k">new</span> <span class="f">HtmlString</span>(<span class="st">'&lt;p&gt;Hello&lt;/p&gt;'</span>))
-&gt;<span class="f">html</span>(fn () =&gt; <span class="f">view</span>(<span class="st">'partials.banner'</span>)-&gt;<span class="f">render</span>())</pre>
<p>Closures resolve through the container, so they can type-hint what they need. The card itself is always available as <code>$card</code>.</p>
<pre class="code">-&gt;<span class="f">html</span>(fn (<span class="f">NovaRequest</span> $request) =&gt; <span class="st">'&lt;p&gt;Hi, '</span>.<span class="f">e</span>($request-&gt;<span class="f">user</span>()-&gt;name).<span class="st">'&lt;/p&gt;'</span>)
-&gt;<span class="f">html</span>(fn ($card) =&gt; <span class="st">"&lt;h2&gt;{$card-&gt;title}&lt;/h2&gt;"</span>)</pre>

<h2>markdown()</h2>
<p>Renders Markdown to HTML. Requires <code>league/commonmark</code>.</p>
<pre class="code">-&gt;<span class="f">markdown</span>(<span class="st">"## 3.0.0\\n\\nLazy loading, caching, dark mode."</span>)
-&gt;<span class="f">markdown</span>(fn () =&gt; <span class="f">Storage</span>::<span class="f">get</span>(<span class="st">'notes.md'</span>))
-&gt;<span class="f">markdown</span>($source, [<span class="st">'allow_unsafe_links'</span> =&gt; <span class="k">false</span>])</pre>
<div class="note"><b>Embedded HTML is stripped by default.</b> Markdown is usually authored content rather than a template you wrote. Call <code>-&gt;trustHtml()</code> if the Markdown is yours and contains HTML you want kept.</div>

<h2>view()</h2>
<p>Renders a Blade view. The card and its extra data are passed in automatically &mdash; <code>$card</code> and <code>$extraData</code> are available without passing them.</p>
<pre class="code">-&gt;<span class="f">view</span>(<span class="st">'nova.cards.summary'</span>, [<span class="st">'year'</span> =&gt; 2026])</pre>
<pre class="code"><span class="cm">{{-- resources/views/nova/cards/summary.blade.php --}}</span>
&lt;table class="w-full"&gt;
    @foreach ($rows <span class="k">as</span> $row)
        &lt;tr&gt;&lt;td&gt;{{ $row-&gt;label }}&lt;/td&gt;&lt;td&gt;{{ $row-&gt;total }}&lt;/td&gt;&lt;/tr&gt;
    @endforeach
&lt;/table&gt;</pre>
<p>This is usually the right choice for anything non-trivial &mdash; Blade escapes by default, and you get a file your editor understands instead of a heredoc.</p>

<h2>text()</h2>
<p>Plain text, HTML-escaped. Use it when the content is data, not markup. <code>-&gt;escape()</code> is an alias.</p>
<pre class="code">-&gt;<span class="f">text</span>($user-&gt;bio)
<span class="cm">// &lt;script&gt;alert(1)&lt;/script&gt; renders as visible text, not as a script</span></pre>

<h2>The content() hook</h2>
<p>Overriding <code>content(): string</code> is the original API and remains fully supported. It is consulted whenever no fluent source was set, which lets you override a subclass at the call site without touching it.</p>
<pre class="code">(<span class="k">new</span> <span class="f">SignupsByYear</span>())-&gt;<span class="f">html</span>(<span class="st">'&lt;p&gt;Maintenance in progress&lt;/p&gt;'</span>);</pre>

<h2>extraData()</h2>
<p>Attaches arbitrary data to the card. It reaches the Vue component as <code>card.extraData</code>, and <code>view()</code> content as <code>$extraData</code>.</p>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>()
    -&gt;<span class="f">extraData</span>([<span class="st">'currency'</span> =&gt; <span class="st">'EUR'</span>])
    -&gt;<span class="f">view</span>(<span class="st">'nova.cards.totals'</span>);</pre>
`},

presentation:{ t:"Presentation", e:"", sub:"Eleven methods, both themes, no CSS required from you.", body:`
<h2>Title and icon</h2>
<pre class="code">-&gt;<span class="f">title</span>(<span class="st">'Sales'</span>)
-&gt;<span class="f">title</span>(fn () =&gt; <span class="st">'Sales for '</span>.<span class="f">now</span>()-&gt;year)
-&gt;<span class="f">icon</span>(<span class="st">'chart-bar'</span>)  <span class="cm">// any Heroicon name</span></pre>
<p>The public <code>$title</code> property stays authoritative for plain strings, so <code>content()</code> can read <code>$this-&gt;title</code>. A closure defers resolution until serialization. Omit both and the card renders no heading at all.</p>

<h2>Width</h2>
<p>Nova's own widths, unchanged.</p>
<pre class="code">-&gt;<span class="f">width</span>(<span class="st">'1/4'</span>)  -&gt;<span class="f">width</span>(<span class="st">'1/3'</span>)  -&gt;<span class="f">width</span>(<span class="st">'1/2'</span>)
-&gt;<span class="f">width</span>(<span class="st">'2/3'</span>)  -&gt;<span class="f">width</span>(<span class="st">'3/4'</span>)  -&gt;<span class="f">width</span>(<span class="st">'full'</span>)</pre>
<div class="note"><b>full forces dynamic.</b> Nova's <code>width('full')</code> also sets <code>height</code> to <code>dynamic</code>. That is Nova's behaviour, not this package's, and it is almost always what you want.</div>

<h2>Height and scrolling</h2>
<pre class="code">-&gt;<span class="f">height</span>(<span class="st">'dynamic'</span>)  <span class="cm">// default — grows with its content</span>
-&gt;<span class="f">height</span>(<span class="st">'fixed'</span>)    <span class="cm">// keeps a fixed height and scrolls</span>
-&gt;<span class="f">height</span>(240)        <span class="cm">// a pixel cap, which implies 'fixed'</span></pre>
<div class="note"><b>Applied inline, not as a Tailwind class.</b> Arbitrary Tailwind values like <code>max-h-[240px]</code> only exist if the host application's own build generated them, so a packaged card cannot rely on them. This is why heights work here regardless of your Tailwind config.</div>

<h2>Alignment</h2>
<pre class="code">-&gt;<span class="f">align</span>(<span class="st">'left'</span>)    <span class="cm">// default</span>
-&gt;<span class="f">align</span>(<span class="st">'center'</span>)
-&gt;<span class="f">align</span>(<span class="st">'right'</span>)</pre>
<div class="note warn"><b>Deprecated.</b> <code>-&gt;center()</code> and the <code>$center</code> property still work &mdash; <code>$center</code> is honoured whenever <code>align()</code> was not called &mdash; but <code>center()</code> emits an <code>E_USER_DEPRECATED</code> notice. Use <code>align()</code>.</div>

<h2>Themes</h2>
<p>A coloured accent border. Five values, correct in both light and dark.</p>
<pre class="code">-&gt;<span class="f">theme</span>(<span class="st">'default'</span>)  <span class="cm">// no accent</span>
-&gt;<span class="f">theme</span>(<span class="st">'info'</span>)     -&gt;<span class="f">theme</span>(<span class="st">'success'</span>)
-&gt;<span class="f">theme</span>(<span class="st">'warning'</span>)  -&gt;<span class="f">theme</span>(<span class="st">'danger'</span>)</pre>

<h2>Card-scoped CSS</h2>
<p>Ship CSS with the card instead of emitting a <code>&lt;style&gt;</code> block from <code>content()</code>. Calling it more than once appends, so a base class can define shared rules and a subclass add to them.</p>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Funnel'</span>)
    -&gt;<span class="f">styles</span>(<span class="st">'
        .funnel-step { padding: 6px 12px; border-radius: 6px; }
        .dark .funnel-step { background: #374151; }
    '</span>)
    -&gt;<span class="f">html</span>($funnelHtml);</pre>

<h2>Header and footer</h2>
<p>Rendered outside the scrolling body, so they stay put in a <code>fixed</code>-height card.</p>
<pre class="code">-&gt;<span class="f">header</span>(<span class="st">'&lt;div class="flex justify-between"&gt;&lt;b&gt;Q1&lt;/b&gt;&lt;/div&gt;'</span>)
-&gt;<span class="f">footer</span>(fn () =&gt; <span class="st">'&lt;small&gt;Updated '</span>.<span class="f">now</span>()-&gt;<span class="f">diffForHumans</span>().<span class="st">'&lt;/small&gt;'</span>)</pre>

<h2>Collapsing</h2>
<pre class="code">-&gt;<span class="f">collapsible</span>()       <span class="cm">// starts expanded</span>
-&gt;<span class="f">collapsible</span>(<span class="k">true</span>)   <span class="cm">// starts collapsed</span></pre>
<p>The heading becomes a button with a chevron and the correct <code>aria-expanded</code>. Requires a title or an icon to click on.</p>

<h2>Removing the chrome</h2>
<p>Drops Nova's background, border, shadow and padding &mdash; for banners, separators and toolbars that should not look like cards.</p>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>()
    -&gt;<span class="f">withoutCardStyles</span>()
    -&gt;<span class="f">width</span>(<span class="st">'full'</span>)
    -&gt;<span class="f">html</span>(<span class="st">'&lt;h2 class="text-xl font-bold"&gt;Monitoring&lt;/h2&gt;'</span>);</pre>

<h2>Dark mode</h2>
<p>Nothing to configure. The card reads Nova's theme and adjusts its scrollbars, skeletons, muted text and borders. Your own markup is still yours to handle &mdash; use <code>.dark</code> selectors inside <code>-&gt;styles()</code>.</p>
`},

performance:{ t:"Performance", e:"", sub:"Keeping card queries off the dashboard's critical path.", body:`
<h2>Why it matters</h2>
<p class="lead">A dashboard of HTML cards runs every card's queries <strong>before the page paints</strong>, because <code>jsonSerialize()</code> is called during the dashboard request. These five methods fix that.</p>

<h2>cache()</h2>
<p>Caches the <strong>rendered HTML</strong>, not the query.</p>
<pre class="code">-&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addHour</span>())
-&gt;<span class="f">cache</span>(3600)                          <span class="cm">// seconds</span>
-&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addDay</span>(), <span class="st">'my-key'</span>)     <span class="cm">// explicit key</span>
-&gt;<span class="f">cache</span>(600, <span class="k">null</span>, <span class="st">'redis'</span>)            <span class="cm">// explicit store</span></pre>
<p>The default key covers the card class <strong>and its lazy state</strong>, so a card parameterised per year does not serve another year's HTML. Read it back with <code>-&gt;cacheKey()</code> when you need to invalidate it yourself.</p>
<pre class="code"><span class="f">Cache</span>::<span class="f">forget</span>((<span class="k">new</span> <span class="f">FunnelTable</span>())-&gt;<span class="f">forYear</span>(2024)-&gt;<span class="f">cache</span>(600)-&gt;<span class="f">cacheKey</span>());</pre>

<h2>lazy()</h2>
<p>Omits the content from the dashboard payload and fetches it over a separate request once the page has painted. The card shows a skeleton meanwhile.</p>
<pre class="code">-&gt;<span class="f">lazy</span>()</pre>
<p>The dashboard's query string is forwarded with the request, so a card that reads request parameters inside <code>content()</code> behaves identically either way.</p>
<pre class="code"><span class="k">public function</span> <span class="f">content</span>(): <span class="k">string</span>
{
    $window = <span class="f">request</span>()-&gt;<span class="f">query</span>(<span class="st">'window'</span>, 60);  <span class="cm">// works lazy or eager</span>
}</pre>
<div class="note"><b>No required constructor arguments.</b> A lazy card is rebuilt from nothing in a second request. A card with a required constructor argument throws <code>LazyCardException</code> at serialization time &mdash; on the dashboard, where you will see it &mdash; rather than failing later. Move the argument onto a <code>#[LazyState]</code> property, or render the card eagerly.</div>

<h2>#[LazyState]</h2>
<p>Fluent state does not survive a lazy round trip on its own. Mark the properties that must.</p>
<pre class="code"><span class="k">use</span> Gabrielesbaiz\\NovaCardHtml\\Attributes\\<span class="f">LazyState</span>;

<span class="k">class</span> <span class="f">FunnelTable</span> <span class="k">extends</span> NovaCardHtml
{
    #[<span class="f">LazyState</span>]
    <span class="k">protected</span> <span class="k">int</span> $year = 2026;

    <span class="k">public function</span> <span class="f">forYear</span>(<span class="k">int</span> $year): <span class="k">static</span>
    {
        $this-&gt;year = $year;

        <span class="k">return</span> $this;
    }
}</pre>
<p>Attributed values are encrypted into the card's token and restored before <code>content()</code> runs. They must be serializable &mdash; scalars, arrays, enums. For full control, override <code>lazyState()</code> and <code>fromLazyState()</code> instead.</p>

<h2>deferUntilVisible()</h2>
<p>Waits until the card scrolls into view before fetching. Implies <code>lazy()</code>. Worth it below the fold on long dashboards; pointless above it.</p>
<pre class="code">-&gt;<span class="f">deferUntilVisible</span>()</pre>

<h2>refreshEvery()</h2>
<p>Re-fetches on an interval, in seconds. Implies <code>lazy()</code>. The timer is cleared on unmount and in-flight requests are aborted, so navigating away does not leave a card polling in the background.</p>
<pre class="code">-&gt;<span class="f">refreshEvery</span>(15)</pre>

<h2>placeholder()</h2>
<p>Replaces the default skeleton shimmer.</p>
<pre class="code">-&gt;<span class="f">placeholder</span>(<span class="st">'&lt;p class="text-sm"&gt;Crunching numbers…&lt;/p&gt;'</span>)</pre>

<h2>Combining them</h2>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Conversion funnel'</span>)
    -&gt;<span class="f">view</span>(<span class="st">'nova.cards.funnel'</span>)
    -&gt;<span class="f">width</span>(<span class="st">'full'</span>)
    -&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addMinutes</span>(10))   <span class="cm">// query runs at most every 10 minutes</span>
    -&gt;<span class="f">deferUntilVisible</span>()            <span class="cm">// …and only if the card is actually seen</span>
    -&gt;<span class="f">refreshEvery</span>(300);             <span class="cm">// …then keeps itself current</span></pre>
<p>With <code>cache()</code> and <code>lazy()</code> together the lookup happens inside the lazy request, so a cache hit costs one small request instead of blocking the dashboard.</p>
`},

recipes:{ t:"Recipes", e:"", sub:"Whole, paste-able solutions.", body:`
<h2>A year matrix that does not block the dashboard</h2>
<pre class="code"><span class="k">use</span> Gabrielesbaiz\\NovaCardHtml\\Attributes\\<span class="f">LazyState</span>;

<span class="k">class</span> <span class="f">SignupsByYear</span> <span class="k">extends</span> NovaCardHtml
{
    <span class="k">public</span> $width = <span class="st">'full'</span>;

    #[<span class="f">LazyState</span>]
    <span class="k">protected</span> <span class="k">int</span> $year = 0;

    <span class="k">public function</span> <span class="f">__construct</span>()
    {
        <span class="k">parent</span>::<span class="f">__construct</span>();

        $this-&gt;year = <span class="f">now</span>()-&gt;year;
    }

    <span class="k">public function</span> <span class="f">forYear</span>(<span class="k">int</span> $year): <span class="k">static</span>
    {
        $this-&gt;year = $year;

        <span class="k">return</span> $this;
    }

    <span class="k">public function</span> <span class="f">content</span>(): <span class="k">string</span>
    {
        $rows = <span class="f">Signup</span>::<span class="f">matrixForYear</span>($this-&gt;year)
            -&gt;<span class="f">map</span>(fn ($cells, $label) =&gt; <span class="st">'&lt;tr&gt;&lt;td&gt;'</span>.$label.<span class="st">'&lt;/td&gt;'</span>.$cells.<span class="st">'&lt;/tr&gt;'</span>)
            -&gt;<span class="f">implode</span>(<span class="st">''</span>);

        <span class="k">return</span> <span class="st">'&lt;table class="w-full"&gt;'</span>.$rows.<span class="st">'&lt;/table&gt;'</span>;
    }
}</pre>
<pre class="code">(<span class="k">new</span> <span class="f">SignupsByYear</span>())-&gt;<span class="f">forYear</span>(2024)-&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addMinutes</span>(30))-&gt;<span class="f">lazy</span>();</pre>
<p>The query runs at most twice an hour, off the critical path, and the year survives the lazy fetch.</p>

<h2>A dashboard toolbar that is not a card</h2>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>()
    -&gt;<span class="f">withoutCardStyles</span>()
    -&gt;<span class="f">width</span>(<span class="st">'full'</span>)
    -&gt;<span class="f">styles</span>(<span class="st">'
        .toolbar-btn { padding: 6px 12px; background: #f3f4f6; color: #374151; }
        .dark .toolbar-btn { background: #374151; color: #d1d5db; }
    '</span>)
    -&gt;<span class="f">html</span>(<span class="st">'&lt;a class="toolbar-btn" href="/exports"&gt;Export CSV&lt;/a&gt;'</span>);</pre>

<h2>Release notes from a Markdown file</h2>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'What is new'</span>)
    -&gt;<span class="f">icon</span>(<span class="st">'sparkles'</span>)
    -&gt;<span class="f">theme</span>(<span class="st">'info'</span>)
    -&gt;<span class="f">markdown</span>(fn () =&gt; <span class="f">Storage</span>::<span class="f">disk</span>(<span class="st">'docs'</span>)-&gt;<span class="f">get</span>(<span class="st">'CHANGELOG.md'</span>))
    -&gt;<span class="f">height</span>(280)
    -&gt;<span class="f">cache</span>(<span class="f">now</span>()-&gt;<span class="f">addDay</span>())
    -&gt;<span class="f">deferUntilVisible</span>();</pre>

<h2>A live counter</h2>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Online now'</span>)
    -&gt;<span class="f">align</span>(<span class="st">'center'</span>)
    -&gt;<span class="f">refreshEvery</span>(15)
    -&gt;<span class="f">html</span>(fn () =&gt; <span class="st">'&lt;p class="text-4xl font-bold"&gt;'</span>.<span class="f">Session</span>::<span class="f">activeCount</span>().<span class="st">'&lt;/p&gt;'</span>);</pre>
<p>No <code>setInterval</code> in your markup: the component owns the timer and clears it on unmount.</p>

<h2>Rendering user-supplied content safely</h2>
<pre class="code"><span class="f">NovaCardHtml</span>::<span class="f">make</span>(<span class="st">'Latest feedback'</span>)
    -&gt;<span class="f">sanitize</span>()
    -&gt;<span class="f">html</span>(fn () =&gt; <span class="f">Feedback</span>::<span class="f">latest</span>()-&gt;<span class="f">take</span>(5)
        -&gt;<span class="f">map</span>(fn ($f) =&gt; <span class="st">'&lt;blockquote&gt;'</span>.$f-&gt;body.<span class="st">'&lt;/blockquote&gt;'</span>)
        -&gt;<span class="f">implode</span>(<span class="st">''</span>));</pre>
<p>Or, if the content is plain text, skip HTML entirely with <code>-&gt;text()</code>.</p>

<h2>A shared base card for a multi-brand dashboard</h2>
<pre class="code"><span class="k">abstract class</span> <span class="f">BrandCard</span> <span class="k">extends</span> NovaCardHtml
{
    <span class="k">public</span> $width = <span class="st">'full'</span>;

    #[<span class="f">LazyState</span>]
    <span class="k">protected</span> ?<span class="k">string</span> $domain = <span class="k">null</span>;

    <span class="k">public function</span> <span class="f">forDomain</span>(?<span class="k">string</span> $domain): <span class="k">static</span>
    {
        $this-&gt;domain = $domain;

        <span class="k">return</span> $this;
    }
}</pre>
<p>One class per report, one call per brand, instead of one class per brand per report.</p>
`},

commands:{ t:"Commands", e:"", sub:"Two artisan commands.", body:`
<h2>nova-card-html</h2>
<pre class="code">php artisan nova-card-html {name}</pre>
<p>Generates a card in <code>app/Nova/Cards</code>. The title is humanized from the class name.</p>
<table class="t"><tr><th>Option</th><th>Description</th></tr>
<tr><td><code>--force</code></td><td>Overwrite an existing file.</td></tr></table>

<h2>nova-card-html:upgrade</h2>
<pre class="code">php artisan nova-card-html:upgrade --dry-run   <span class="cm"># preview</span>
php artisan nova-card-html:upgrade             <span class="cm"># apply</span></pre>
<p>Migrates 2.x subclasses to the 3.0 defaults, and reports the cards that are candidates for the new features.</p>
<table class="t"><tr><th>Option</th><th>Default</th><th>Description</th></tr>
<tr><td><code>--path=</code></td><td><code>app</code></td><td>Directory to scan for <code>NovaCardHtml</code> subclasses.</td></tr>
<tr><td><code>--dry-run</code></td><td>off</td><td>Report what would change without writing.</td></tr></table>
<p>It does three things:</p>
<ul>
<li>removes <code>$height = 'dynamic'</code>, <code>$center = false</code> and <code>$title = ''</code> declarations that now only restate a default;</li>
<li>rewrites <code>public bool $center = true;</code> to <code>public string $align = 'center';</code> so explicitly centred cards stay centred;</li>
<li><strong>reports, without editing</strong>, cards that inject a <code>&lt;style&gt;</code> block (&rarr; <code>styles()</code>), hand-write dark mode CSS, hand-roll <code>setInterval</code> polling (&rarr; <code>refreshEvery()</code>), or carry fluent state with no <code>#[LazyState]</code> attribute (which blocks <code>lazy()</code>).</li>
</ul>
`},

api:{ t:"API reference", e:"", sub:"Thirty-two public methods across five groups.", body:`
<h2>Construction</h2>
<table class="t"><tr><th>Method</th><th>Description</th></tr>
<tr><td><code>make(...$arguments)</code></td><td>Build a card without a subclass. The first argument is the <b>title</b>.</td></tr>
<tr><td><code>__construct(?string $component = null)</code></td><td>Override the Vue component. Defaults to <code>nova-card-html</code>.</td></tr></table>

<h2>Content</h2>
<table class="t"><tr><th>Method</th><th>Description</th></tr>
<tr><td><code>html(Closure|string|Htmlable)</code></td><td>Raw HTML.</td></tr>
<tr><td><code>markdown(Closure|string, array $options = [])</code></td><td>Markdown &rarr; HTML. Needs <code>league/commonmark</code>.</td></tr>
<tr><td><code>view(string $view, array $data = [])</code></td><td>Render a Blade view.</td></tr>
<tr><td><code>text(Closure|string)</code></td><td>Escaped plain text.</td></tr>
<tr><td><code>escape(Closure|string)</code></td><td>Alias of <code>text()</code>.</td></tr>
<tr><td><code>content(): string</code></td><td>The overridable hook. Used when no fluent source was set.</td></tr>
<tr><td><code>renderContent(): string</code></td><td>Resolve, cache and sanitize. Called during serialization.</td></tr>
<tr><td><code>extraData(array)</code></td><td>Data for the component and for <code>view()</code>.</td></tr></table>

<h2>Presentation</h2>
<table class="t"><tr><th>Method</th><th>Default</th><th>Description</th></tr>
<tr><td><code>title(Closure|string|null)</code></td><td><code>''</code></td><td>Card heading.</td></tr>
<tr><td><code>icon(?string)</code></td><td><code>null</code></td><td>Heroicon name.</td></tr>
<tr><td><code>theme(string)</code></td><td><code>'default'</code></td><td><code>default</code>, <code>info</code>, <code>success</code>, <code>warning</code>, <code>danger</code>.</td></tr>
<tr><td><code>width(string)</code></td><td><code>'1/3'</code></td><td>Nova's widths. Inherited from <code>Card</code>.</td></tr>
<tr><td><code>height(string|int)</code></td><td><code>'dynamic'</code></td><td><code>dynamic</code>, <code>fixed</code>, or pixels.</td></tr>
<tr><td><code>align(string)</code></td><td><code>'left'</code></td><td><code>left</code>, <code>center</code>, <code>right</code>.</td></tr>
<tr><td><code>center(bool = true)</code></td><td>&mdash;</td><td><span class="pill grey">Deprecated</span> Use <code>align()</code>.</td></tr>
<tr><td><code>styles(string $css)</code></td><td><code>null</code></td><td>Card-scoped CSS. Appends.</td></tr>
<tr><td><code>header(Closure|string)</code></td><td><code>null</code></td><td>HTML above the body.</td></tr>
<tr><td><code>footer(Closure|string)</code></td><td><code>null</code></td><td>HTML below the body.</td></tr>
<tr><td><code>collapsible(bool $collapsedByDefault = false)</code></td><td>off</td><td>Make the body collapsible.</td></tr>
<tr><td><code>withoutCardStyles(bool = true)</code></td><td>off</td><td>Drop Nova's card chrome.</td></tr></table>

<h2>Performance</h2>
<table class="t"><tr><th>Method</th><th>Default</th><th>Description</th></tr>
<tr><td><code>cache($ttl, ?string $key, ?string $store)</code></td><td>off</td><td>Cache the rendered HTML.</td></tr>
<tr><td><code>cacheKey(): string</code></td><td>&mdash;</td><td>The key in use.</td></tr>
<tr><td><code>lazy(bool = true)</code></td><td>off</td><td>Fetch content after paint.</td></tr>
<tr><td><code>isLazy(): bool</code></td><td>&mdash;</td><td>Whether the card is lazy.</td></tr>
<tr><td><code>deferUntilVisible(bool = true)</code></td><td>off</td><td>Fetch on scroll. Implies <code>lazy()</code>.</td></tr>
<tr><td><code>refreshEvery(int $seconds)</code></td><td>off</td><td>Poll. Implies <code>lazy()</code>.</td></tr>
<tr><td><code>placeholder(Closure|string)</code></td><td>skeleton</td><td>Replace the loading state.</td></tr>
<tr><td><code>lazyState(): array</code></td><td><code>#[LazyState]</code></td><td>State to carry across the fetch.</td></tr>
<tr><td><code>fromLazyState(array)</code></td><td>&mdash;</td><td>Restore that state.</td></tr></table>

<h2>Safety</h2>
<table class="t"><tr><th>Method</th><th>Default</th><th>Description</th></tr>
<tr><td><code>sanitize(bool = true, ?HtmlSanitizer = null)</code></td><td>off</td><td>Sanitize before render.</td></tr>
<tr><td><code>trustHtml()</code></td><td>on</td><td>Opt out, beating the global default.</td></tr></table>
`},

troubleshooting:{ t:"Troubleshooting", e:"", sub:"Errors and symptoms you are likely to hit.", body:`
<h2>LazyCardException: must be constructible with no arguments</h2>
<p>A lazy card is rebuilt from scratch in a separate request, so the package cannot supply your constructor arguments. Move them onto <code>#[LazyState]</code> properties, or drop <code>-&gt;lazy()</code> from that card.</p>
<pre class="code"><span class="cm">// before</span>
<span class="k">public function</span> <span class="f">__construct</span>(<span class="k">private string</span> $message) { <span class="k">parent</span>::<span class="f">__construct</span>(); }

<span class="cm">// after</span>
#[<span class="f">LazyState</span>]
<span class="k">protected string</span> $message = <span class="st">''</span>;</pre>

<h2>My lazy card loses its year or filter</h2>
<p>The property carrying it is not marked <code>#[LazyState]</code>, so it was not captured into the token and the rebuilt card got the declared default. Add the attribute, or override <code>lazyState()</code> and <code>fromLazyState()</code>.</p>
<p>The state must be serializable &mdash; a closure or a model instance will not round-trip. Store the id and re-query inside <code>content()</code>.</p>

<h2>My lazy card 403s, but the eager version rendered</h2>
<p>Authorization set with <code>-&gt;canSee()</code> at the call site does not survive: the lazy request rebuilds the card from its class and its state, not from the instance on the dashboard. Move the rule into the class.</p>
<pre class="code"><span class="k">public function</span> <span class="f">authorize</span>(<span class="f">Request</span> $request)
{
    <span class="k">return</span> $request-&gt;<span class="f">user</span>()?-&gt;<span class="f">can</span>(<span class="st">'viewReports'</span>) === <span class="k">true</span>;
}</pre>

<h2>My card reads the query string and the lazy version sees nothing</h2>
<p>The dashboard query string <b>is</b> forwarded, so this normally works. Check you are reading the query rather than the route: the lazy request hits <code>nova-vendor/nova-card-html/content</code>, so route parameters and <code>$request-&gt;path()</code> differ by design. Anything you need must be a query parameter or <code>#[LazyState]</code>.</p>

<h2>Rendering Markdown requires league/commonmark</h2>
<pre class="code">composer require league/commonmark</pre>
<p>Or switch that card to <code>-&gt;html()</code> or <code>-&gt;view()</code>.</p>

<h2>My cached card will not update</h2>
<p><code>-&gt;cache()</code> caches the rendered HTML, so editing the source changes nothing until the TTL expires. Clear it explicitly &mdash; and if the card is parameterised, build it the same way you did when it was cached, because the default key includes the lazy state.</p>
<pre class="code"><span class="f">Cache</span>::<span class="f">forget</span>((<span class="k">new</span> <span class="f">MyCard</span>())-&gt;<span class="f">cache</span>(600)-&gt;<span class="f">cacheKey</span>());</pre>

<h2>My Tailwind classes do nothing inside the card</h2>
<p>Card markup is not part of your application's Tailwind build, so the JIT never sees those class names and never generates them. Utilities that Nova itself uses are present; arbitrary values like <code>max-h-[240px]</code> are not.</p>
<p>Use <code>-&gt;styles()</code> for card CSS, <code>-&gt;height(240)</code> for heights, or add the card's source path to your Tailwind <code>content</code> globs.</p>

<h2>My card looks wrong in dark mode</h2>
<p>The package styles its own chrome for both themes, but markup you emit is yours. Add <code>.dark</code> rules through <code>-&gt;styles()</code>.</p>

<h2>Every generated card fatals with "Class CardHtml not found"</h2>
<p>You are on 2.2.0 or earlier, where the generator stub still referenced a class that had been renamed away. Upgrade to 2.2.1 or 3.0.</p>
`},

security:{ t:"Security", e:"", sub:"The trust boundary, and what is deliberate.", body:`
<h2>The trust boundary</h2>
<p class="lead">This package renders server-produced HTML through Vue's <code>v-html</code>. That is its entire purpose, and it means <strong>card content is a trust boundary</strong>.</p>
<ul>
<li><strong>Content is trusted by default.</strong> It is assumed to be authored by your application, in PHP, and is passed through untouched.</li>
<li><strong>Anything user-derived needs <code>-&gt;sanitize()</code></strong> &mdash; a name, a comment, a filename, an imported spreadsheet cell. Otherwise you have stored XSS in your admin panel.</li>
<li><strong><code>-&gt;text()</code> escapes</strong> and is always safe.</li>
<li><strong>Markdown strips embedded HTML</strong> unless you call <code>-&gt;trustHtml()</code>.</li>
</ul>

<h2>The sanitizers</h2>
<table class="t"><tr><th>Driver</th><th>When used</th><th>What it does</th></tr>
<tr><td><code>allow-list</code></td><td>Always available, no dependency</td><td>DOM-based allow list: known-good tags and attributes only, every <code>on*</code> handler dropped, <code>javascript:</code> / <code>vbscript:</code> / <code>data:text/html</code> URLs dropped.</td></tr>
<tr><td><code>purifier</code></td><td>When <code>mews/purifier</code> is installed</td><td>Delegates to HTMLPurifier.</td></tr></table>
<p>Disallowed tags are <strong>unwrapped, not deleted</strong>, so their content survives &mdash; except <code>script</code>, <code>style</code>, <code>iframe</code>, <code>object</code>, <code>embed</code> and <code>template</code>, which are removed whole.</p>
<pre class="code"><span class="st">'&lt;marquee&gt;&lt;b&gt;keep&lt;/b&gt;&lt;/marquee&gt;'</span>   <span class="cm">// becomes &lt;b&gt;keep&lt;/b&gt;</span></pre>
<p>Pass your own implementation of <code>HtmlSanitizer</code> when neither fits.</p>

<h2>Lazy tokens</h2>
<ul>
<li><strong>Tokens are encrypted</strong>, not merely signed, so card class names are not disclosed to the browser and tokens cannot be forged.</li>
<li><strong>A valid token proves provenance, not permission.</strong> The endpoint re-instantiates the card and re-runs <code>authorize()</code> on every request.</li>
<li><strong>The endpoint refuses any token whose class is not a <code>NovaCardHtml</code> subclass</strong>, so a token can never instantiate arbitrary application classes.</li>
<li><strong>The route lives inside Nova's own middleware group</strong>, so Nova authentication and the <code>viewNova</code> gate apply before any of the above runs.</li>
</ul>

<h2>Reporting a vulnerability</h2>
<p>See <a href="https://github.com/gabrielesbaiz/nova-card-html/blob/main/SECURITY.md">SECURITY.md</a>. Please do not open a public issue.</p>
`},

upgrade:{ t:"Upgrading from 2.x", e:"", sub:"Most cards need no changes at all.", body:`
<h2>Requirements</h2>
<table class="t"><tr><th></th><th>2.x</th><th>3.0</th></tr>
<tr><td>PHP</td><td>^8.0</td><td>^8.3</td></tr>
<tr><td>Laravel</td><td>10, 11, 12</td><td>12, 13</td></tr>
<tr><td>Nova</td><td>^5.0</td><td>^5.7 (&lt;6.0)</td></tr></table>
<p>Laravel 13 requires PHP 8.3, which sets the new floor.</p>

<h2>What keeps working</h2>
<p>If your cards look like this &mdash; and virtually all of them do &mdash; they need <strong>no changes</strong>.</p>
<pre class="code"><span class="k">class</span> <span class="f">MyCard</span> <span class="k">extends</span> NovaCardHtml
{
    <span class="k">public</span> $width = <span class="st">'full'</span>;

    <span class="k">public function</span> <span class="f">content</span>(): <span class="k">string</span>
    {
        <span class="k">return</span> <span class="st">'&lt;p&gt;…&lt;/p&gt;'</span>;
    }
}</pre>
<ul>
<li>Overriding <code>content(): string</code>. This remains the primary API and is not deprecated.</li>
<li>The <code>$title</code>, <code>$width</code> and <code>$height</code> properties.</li>
<li>A subclass <code>__construct()</code> calling <code>parent::__construct()</code> with no arguments.</li>
<li><code>extraData()</code>.</li>
</ul>

<h2>Breaking changes</h2>
<ul>
<li><strong>Default height is now <code>dynamic</code></strong> (was <code>fixed</code>).</li>
<li><strong>Default alignment is now left</strong> (was centred).</li>
<li><strong>The <code>$content</code> property was removed.</strong> It never did anything &mdash; <code>jsonSerialize()</code> always called the <code>content()</code> <em>method</em> and ignored the property.</li>
<li><strong><code>$center</code> / <code>center()</code> are deprecated.</strong> Both still work; <code>center()</code> emits an <code>E_USER_DEPRECATED</code> notice.</li>
</ul>
<p>Cards that set <code>$height</code> or <code>$center</code> explicitly are unaffected. Restore the old behaviour with <code>public $height = 'fixed';</code> and <code>public string $align = 'center';</code>.</p>

<h2>The upgrade command</h2>
<pre class="code">php artisan nova-card-html:upgrade --dry-run   <span class="cm"># preview</span>
php artisan nova-card-html:upgrade             <span class="cm"># apply</span></pre>
<p>See <a href="#/commands">Commands</a> for what it rewrites and what it only reports. Full detail in <a href="https://github.com/gabrielesbaiz/nova-card-html/blob/main/UPGRADE.md">UPGRADE.md</a>.</p>
`},

changelog:{ t:"Changelog", e:"", sub:"Mirrors CHANGELOG.md.", body:`
<h2>3.0.0 <span class="pill">2026-09-25</span></h2>
<h3>Requirements</h3>
<ul>
<li>Requires PHP 8.3+, Laravel 12 or 13, and Nova 5.7+ (Nova 6 is explicitly conflicted).</li>
<li>Dropped Laravel 10 and 11, and PHP 8.0&ndash;8.2.</li>
</ul>
<h3>Added</h3>
<ul>
<li>Fluent API: <code>NovaCardHtml::make()</code> builds a card without declaring a subclass.</li>
<li>Content sources: <code>html()</code>, <code>markdown()</code>, <code>view()</code>, <code>text()</code>/<code>escape()</code>.</li>
<li>Lazy loading: <code>lazy()</code>, <code>deferUntilVisible()</code>, <code>refreshEvery()</code>, <code>placeholder()</code>, with <code>#[LazyState]</code> to carry fluent state across the round trip.</li>
<li>Caching: <code>cache($ttl, $key, $store)</code>, keyed on the card class and its state.</li>
<li>Presentation: <code>icon()</code>, <code>theme()</code>, <code>align()</code>, <code>styles()</code>, <code>collapsible()</code>, <code>header()</code>, <code>footer()</code>, <code>withoutCardStyles()</code>, and an integer <code>height()</code>.</li>
<li>Sanitizing: opt-in <code>sanitize()</code> with a dependency-free allow-list sanitizer, plus <code>trustHtml()</code>.</li>
<li>Dark mode support, a skeleton loading state, and a retry affordance.</li>
<li><code>php artisan nova-card-html:upgrade</code> to migrate subclasses from 2.x.</li>
<li>A publishable config file and translations.</li>
<li>Real test coverage: 71 Pest tests and 15 Vitest component tests.</li>
</ul>
<h3>Changed</h3>
<ul>
<li><strong>Default height is now <code>dynamic</code></strong> (was <code>fixed</code>).</li>
<li><strong>Default alignment is now left</strong> (was centred).</li>
<li><code>jsonSerialize()</code> now merges the card's own keys last, so Nova's <code>Card</code> base class can no longer override them.</li>
<li>The build moved from Laravel Mix to Vite; <code>dist/</code> output paths are unchanged.</li>
<li>Card heights are applied as inline styles instead of arbitrary Tailwind classes.</li>
<li><code>title()</code> keeps the public <code>$title</code> property authoritative for plain strings.</li>
</ul>
<h3>Deprecated</h3>
<ul><li><code>$center</code> and <code>center()</code>; use <code>$align</code> and <code>align()</code>.</li></ul>
<h3>Removed</h3>
<ul>
<li>The unused <code>$content</code> property.</li>
<li>Laravel Mix, <code>nova.mix.js</code>, <code>postcss.config.js</code>, <code>.php-cs-fixer.php</code> and <code>tlint.json</code>; the unused <code>spatie/laravel-package-tools</code>, <code>vuex</code> and <code>axios</code> dependencies.</li>
</ul>
<h3>Fixed</h3>
<ul>
<li><strong>The card generator produced broken classes.</strong> <code>NovaCard.stub</code> still extended the renamed-away <code>CardHtml</code>, so every card created by <code>php artisan nova-card-html</code> fatalled on load.</li>
<li><code>__construct()</code> no longer breaks <code>Card::__construct($component)</code> compatibility, and the dead <code>request()-&gt;is('nova-api/metrics/*')</code> guard was removed.</li>
<li>The dead <code>uri-key</code> replacement in the generator command.</li>
<li>Scrollbar styling was hardcoded to light colours and broke in Nova dark mode.</li>
</ul>

<h2>2.2.0 &mdash; 2.0.0</h2>
<p>Nova 5 support, and the rename from <code>CardHtml</code> to <code>NovaCardHtml</code>.</p>

<h2>1.0.0</h2>
<p>Initial release, based on <a href="https://github.com/abordage/nova-card-html">abordage/nova-card-html</a>.</p>
`}

};

/* ══════════ DOCS ROUTE ══════════ */

/* The left nav groups. Order is fixed across every package site. */
var GROUPS = [
  ["Getting started", ["intro","install","config"]],
  ["Usage",           ["guide","presentation","performance","recipes","commands"]],
  ["Reference",       ["api","troubleshooting"]],
  ["Project",         ["security","upgrade","changelog"]]
];
var ORDER = GROUPS.reduce(function(a,g){ return a.concat(g[1]); }, []);

var sidenav = document.getElementById("sidenav");
var content = document.getElementById("content");
var raillinks = document.getElementById("raillinks");
var rail = document.getElementById("rail");
var current = null;

/* ── left nav ── */
GROUPS.forEach(function(g){
  var box = document.createElement("div");
  box.className = "navgroup";
  var h = document.createElement("h4");
  h.textContent = g[0];
  box.appendChild(h);
  g[1].forEach(function(id){
    var a = document.createElement("a");
    a.href = "#/" + id;
    a.dataset.page = id;
    a.textContent = PAGES[id].t;
    box.appendChild(a);
  });
  sidenav.appendChild(box);
});

/* ── render a page, then build the rail from the DOM it produced ── */
function render(id){
  if (!PAGES[id]) id = "intro";
  current = id;
  var p = PAGES[id];

  var i = ORDER.indexOf(id);
  var prev = i > 0 ? ORDER[i-1] : null;
  var next = i < ORDER.length-1 ? ORDER[i+1] : null;

  content.innerHTML =
    '<article class="page on">' +
      '<h1>' + p.t + '</h1>' +
      (p.sub ? '<p class="sub">' + p.sub + '</p>' : '') +
      p.body +
      '<div class="pager">' +
        (prev ? '<a href="#/'+prev+'"><small>Previous</small>&larr; '+PAGES[prev].t+'</a>' : '<span></span>') +
        (next ? '<a href="#/'+next+'" style="text-align:right"><small>Next</small>'+PAGES[next].t+' &rarr;</a>' : '<span></span>') +
      '</div>' +
    '</article>';

  sidenav.querySelectorAll("a").forEach(function(a){
    if (a.dataset.page === id) a.setAttribute("aria-current","page");
    else a.removeAttribute("aria-current");
  });

  buildRail();
  sidenav.classList.remove("open");
  window.scrollTo({top:0, behavior:"auto"});
}

/* ── right rail: the current page's own h2s, numbered ── */
var railObserver = null;
function buildRail(){
  if (railObserver){ railObserver.disconnect(); railObserver = null; }
  raillinks.innerHTML = "";
  var heads = Array.prototype.slice.call(content.querySelectorAll("h2"));

  /* Fewer than three sections does not need a rail. */
  if (heads.length < 3){ rail.style.display = "none"; return; }
  rail.style.display = "";

  heads.forEach(function(h,i){
    if (!h.id) h.id = "s" + (i+1) + "-" + h.textContent.toLowerCase()
      .replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,40);
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.dataset.target = h.id;
    a.innerHTML = '<i>' + String(i+1).padStart(2,"0") + '</i><span>' + h.textContent + '</span>';
    a.addEventListener("click", function(e){
      e.preventDefault();
      h.scrollIntoView({behavior: REDUCED ? "auto" : "smooth", block:"start"});
    });
    raillinks.appendChild(a);
  });

  /* Topmost visible section wins, so the marker cannot flicker
     between two that are both partly on screen. */
  var visible = new Set();
  railObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) visible.add(en.target.id);
      else visible.delete(en.target.id);
    });
    var top = heads.map(function(h){return h.id;}).filter(function(id){return visible.has(id);})[0];
    raillinks.querySelectorAll("a").forEach(function(a){
      a.classList.toggle("on", a.dataset.target === top);
    });
  }, {rootMargin:"-70px 0px -60% 0px"});
  heads.forEach(function(h){ railObserver.observe(h); });
}

/* ── routing ── */
function route(){
  var m = /^#\/([a-z-]+)/.exec(location.hash);
  render(m ? m[1] : "intro");
}


/* ── mobile nav ── */
document.getElementById("navtoggle").addEventListener("click", function(){
  sidenav.classList.toggle("open");
});

/* ══════════ LANDING ROUTE ══════════ */

/* ── marquee: the real API surface, duplicated for a seamless -50% loop ── */
var API = ["html()","markdown()","view()","text()","title()","icon()","theme()","width()",
  "height()","align()","styles()","header()","footer()","collapsible()","withoutCardStyles()",
  "cache()","lazy()","deferUntilVisible()","refreshEvery()","placeholder()","sanitize()",
  "trustHtml()","extraData()","escape()","cacheKey()"];
var marq = document.getElementById("marq");
var run = API.map(function(a){ return '<span><b>-&gt;</b>'+a+'</span>'; }).join("");
marq.innerHTML = run + run;

/* The hero reveal and the .reveal observers are started by startLanding(),
   so they fire when the landing route is shown rather than at load. */

/* ── A · dashboard fills ── */
var dashDone = false;
function fillDash(){
  if (dashDone) return;
  dashDone = true;
  var cards = document.querySelectorAll("#dash .c");
  var ms = document.getElementById("dashMs");
  cards.forEach(function(c,i){ later(function(){ c.classList.add("done"); }, 260 + i*200); });
  later(function(){ ms.textContent = "6 cards · 210ms to first paint"; }, 260 + cards.length*200);
}

/* ── B · payload ── */
var SOURCES = {
  /* Every example is self-contained: the pane on the left shows everything
     needed to produce the pane on the right, and nothing more. */
  html:{ file:"app/Nova/Cards/Funnel.php",
    parts:[{t:"class ",c:"k"},{t:"Funnel ",c:"f"},{t:"extends ",c:"k"},{t:"NovaCardHtml\n{\n    ",c:""},
      {t:"public function ",c:"k"},{t:"content",c:"f"},{t:"(): ",c:""},{t:"string\n    {\n        ",c:"k"},
      {t:"return ",c:"k"},{t:"'<h4>Conversion funnel</h4>'\n             . ",c:"st"},
      {t:"'<div class=\"n\">62.4%</div>'\n             . ",c:"st"},
      {t:"'<p>Trial → paid, rolling 30 days.</p>'",c:"st"},
      {t:";\n    }\n}",c:""}],
    out:{title:"Conversion funnel",num:"62.4%",body:"Trial → paid, rolling 30 days."} },

  markdown:{ file:"app/Nova/Dashboards/Main.php",
    parts:[{t:"NovaCardHtml",c:"f"},{t:"::",c:""},{t:"make",c:"f"},{t:"(",c:""},{t:"'Release notes'",c:"st"},
      {t:")\n    ->",c:""},{t:"markdown",c:"f"},{t:"(\n        ",c:""},
      {t:"\"## 3.0.0\\n\\nLazy loading, caching, dark mode.\"",c:"st"},
      {t:"\n    );",c:""}],
    /* "## 3.0.0" is an <h2>, so it renders as a heading -- not as the
       giant metric style, which belongs to <div class="n">. */
    out:{title:"Release notes",num:"3.0.0",numAs:"heading",body:"Lazy loading, caching, dark mode."} },

  view:{ file:"Main.php + signups.blade.php",
    parts:[{t:"// app/Nova/Dashboards/Main.php\n",c:"cm"},
      {t:"NovaCardHtml",c:"f"},{t:"::",c:""},{t:"make",c:"f"},{t:"(",c:""},{t:"'Signups by year'",c:"st"},
      {t:")\n    ->",c:""},{t:"view",c:"f"},{t:"(",c:""},{t:"'nova.cards.signups'",c:"st"},{t:", [",c:""},
      {t:"'total'",c:"st"},{t:" => ",c:""},{t:"602",c:"f"},{t:"]);\n\n",c:""},
      {t:"{{-- resources/views/nova/cards/signups.blade.php --}}\n",c:"cm"},
      {t:"<div class=\"n\">",c:""},{t:"{{ $total }}",c:"f"},{t:"</div>\n",c:""},
      {t:"<p>Blade escapes by default.</p>",c:""}],
    out:{title:"Signups by year",num:"602",body:"Blade escapes by default."} },

  text:{ file:"app/Nova/Dashboards/Main.php",
    parts:[{t:"NovaCardHtml",c:"f"},{t:"::",c:""},{t:"make",c:"f"},{t:"(",c:""},{t:"'Latest feedback'",c:"st"},
      {t:")\n    ->",c:""},{t:"text",c:"f"},{t:"(",c:""},
      {t:"'<b>Great service</b> — 5 stars'",c:"st"},{t:");\n\n",c:""},
      {t:"// text() escapes its input, so the tags render as\n// characters rather than as markup.",c:"cm"}],
    out:{title:"Latest feedback",num:"",body:"<b>Great service</b> — 5 stars"} }
};
var activeSrc = "html", typeTimer = null;

function runPayload(){
  var src = SOURCES[activeSrc];
  var pre = document.getElementById("code");
  var card = document.getElementById("outcard");
  clearTimeout(typeTimer);
  document.getElementById("paneFile").textContent = src.file;
  pre.textContent = "";
  card.classList.remove("in");

  function fill(){
    var num = document.getElementById("outNum");
    document.getElementById("outTitle").textContent = src.out.title;
    num.textContent = src.out.num;
    num.style.display = src.out.num ? "" : "none";
    num.classList.toggle("as-heading", src.out.numAs === "heading");
    document.getElementById("outBody").textContent = src.out.body;
    card.classList.add("in");
  }
  if (REDUCED){
    src.parts.forEach(function(p){
      var s=document.createElement("span"); if(p.c) s.className=p.c; s.textContent=p.t; pre.appendChild(s);
    });
    fill(); return;
  }
  var caret=document.createElement("span"); caret.className="caret"; pre.appendChild(caret);
  var pi=0, ci=0, span=null;
  (function tick(){
    if (pi >= src.parts.length){ caret.remove(); fill(); return; }
    var part = src.parts[pi];
    if (ci === 0){
      span=document.createElement("span");
      if (part.c) span.className=part.c;
      pre.insertBefore(span, caret);
    }
    span.textContent += part.t.charAt(ci);
    if (++ci >= part.t.length){ pi++; ci=0; }
    typeTimer = setTimeout(tick, 13);
  })();
}
document.getElementById("srcs").addEventListener("click", function(e){
  var b = e.target.closest(".src");
  if (!b) return;
  activeSrc = b.dataset.src;
  document.querySelectorAll(".src").forEach(function(x){
    x.setAttribute("aria-pressed", x === b ? "true" : "false");
  });
  runPayload();
});

/* ── C · counter ── */
var savedDone = false;
function runSaved(){
  if (savedDone) return;
  savedDone = true;
  var el = document.getElementById("saved");
  if (REDUCED){ el.textContent = "1,630ms saved"; return; }
  var t0 = performance.now();
  (function step(){
    var p = Math.min(1,(performance.now()-t0)/1000);
    var e = 1 - Math.pow(1-p,3);
    el.textContent = Math.round(e*1630).toLocaleString() + "ms saved";
    if (p < 1) requestAnimationFrame(step);
  })();
}

/* ── card geometry: Sheet 02 drives a real card, live ── */
var SPEC = { height:"dynamic", align:"left", theme:"default" };
var TOG  = { icon:false, header:false, footer:false, collapsible:false, styles:false,
             bare:false, lazy:false, placeholder:false, refresh:false, sanitize:false };
var SPECTHEME = { "default":"#44443f", info:"#12508f", success:"#1a5c31",
                  warning:"#7d5200", danger:"#a5211a" };
var SPECHINT = {
  dynamic:"Grows with its content — no scrollbar.",
  fixed:"Capped at the default 128px — the body scrolls.",
  "240":"Capped at 240px — applied inline, so no Tailwind class is needed."
};
var lazyTimer = null, refreshTimer = null;

function specApply(){
  var card = document.getElementById("live");
  var body = document.getElementById("livebody");
  var hint = document.getElementById("livehint");
  var code = document.getElementById("livecode");
  if (!card) return;

  card.style.setProperty("--live", SPECTHEME[SPEC.theme]);

  if (SPEC.height === "dynamic"){
    body.style.maxHeight = ""; body.classList.remove("scrolls");
  } else {
    body.style.maxHeight = (SPEC.height === "fixed" ? 128 : 240) + "px";
    body.classList.add("scrolls");
  }
  body.style.textAlign = SPEC.align;

  card.classList.toggle("has-icon", TOG.icon);
  card.classList.toggle("has-header", TOG.header);
  card.classList.toggle("has-footer", TOG.footer);
  card.classList.toggle("has-collapsible", TOG.collapsible);
  card.classList.toggle("has-styles", TOG.styles);
  card.classList.toggle("bare", TOG.bare);
  card.classList.toggle("has-refresh", TOG.refresh);
  card.classList.toggle("has-sanitize", TOG.sanitize);
  if (!TOG.collapsible) card.classList.remove("collapsed");

  /* sanitize(): the same user-supplied fragment, with and without the pass */
  var usr = document.getElementById("liveusr");
  var lab = document.getElementById("liveusrlab");
  var q   = document.getElementById("liveusrq");
  card.classList.toggle("show-usr", TOG.sanitize);
  if (TOG.sanitize){
    usr.classList.remove("unsafe");
    lab.textContent = "user-supplied · onclick stripped";
    q.textContent = "Great service";
  } else {
    usr.classList.add("unsafe");
    lab.textContent = "user-supplied · rendered as authored";
    q.textContent = '<b onclick="steal()">Great service</b>';
  }

  /* placeholder() only means anything while something is loading */
  var ph = document.getElementById("liveph");
  if (ph) ph.textContent = TOG.placeholder ? "Crunching numbers…" : "";

  hint.textContent = TOG.lazy
    ? "Fetched after the dashboard paints — skeleton first."
    : SPECHINT[SPEC.height];

  /* the generated call: only the options actually switched on */
  var L = ['<em>NovaCardHtml</em>::make(<b>\'Conversion funnel\'</b>)'];
  if (TOG.icon)            L.push("    ->icon(<b>'chart-bar'</b>)");
  if (SPEC.theme !== "default") L.push("    ->theme(<b>'" + SPEC.theme + "'</b>)");
  L.push("    ->height(" + (SPEC.height === "240" ? "<u>240</u>" : "<b>'" + SPEC.height + "'</b>") + ")");
  L.push("    ->align(<b>'" + SPEC.align + "'</b>)");
  if (TOG.styles)      L.push("    ->styles(<b>'tr:nth-child(odd){background:…}'</b>)");
  if (TOG.header)      L.push("    ->header(<b>'&lt;span&gt;Q1 · 2026&lt;/span&gt;'</b>)");
  if (TOG.footer)      L.push("    ->footer(<b>'Updated 2 minutes ago'</b>)");
  if (TOG.collapsible) L.push("    ->collapsible()");
  if (TOG.bare)        L.push("    ->withoutCardStyles()");
  if (TOG.sanitize)    L.push("    ->sanitize()");
  if (TOG.lazy)        L.push("    ->lazy()");
  if (TOG.placeholder) L.push("    ->placeholder(<b>'&lt;p&gt;Crunching numbers…&lt;/p&gt;'</b>)");
  if (TOG.refresh)     L.push("    ->refreshEvery(<u>15</u>)");
  code.innerHTML = L.join("\n") + ";";

  runLoading();
}

/* lazy()/refreshEvery() are only visible as behaviour, so play it */
function runLoading(){
  var card = document.getElementById("live");
  clearTimeout(lazyTimer); clearInterval(refreshTimer);
  card.classList.remove("loading");
  if (REDUCED) return;

  if (TOG.lazy){
    card.classList.add("loading");
    lazyTimer = setTimeout(function(){ card.classList.remove("loading"); }, 1100);
  }
  if (TOG.refresh){
    refreshTimer = setInterval(function(){
      card.classList.add("loading");
      setTimeout(function(){ card.classList.remove("loading"); }, 700);
    }, 4000);   /* 15s is the documented value; shortened here so it is visible */
  }
}

(function specWire(){
  var box = document.getElementById("ctrls");
  if (!box) return;
  box.addEventListener("click", function(e){
    var b = e.target.closest(".opt");
    if (!b) return;
    if (b.dataset.k){                      /* one-of-many */
      SPEC[b.dataset.k] = b.dataset.v;
      box.querySelectorAll('.opt[data-k="' + b.dataset.k + '"]').forEach(function(o){
        o.setAttribute("aria-pressed", o === b ? "true" : "false");
      });
    } else if (b.dataset.t){               /* on / off */
      var k = b.dataset.t;
      TOG[k] = !TOG[k];
      if (k === "placeholder" && TOG[k] && !TOG.lazy){
        TOG.lazy = true;                   /* a placeholder needs something to wait for */
        box.querySelector('.opt[data-t="lazy"]').setAttribute("aria-pressed","true");
      }
      b.setAttribute("aria-pressed", String(TOG[k]));
    }
    specApply();
  });
  var bar = document.getElementById("livebar");
  if (bar) bar.addEventListener("click", function(){
    if (TOG.collapsible) document.getElementById("live").classList.toggle("collapsed");
  });
  specApply();
})();

/* ── the width mocks grow when the sheet is reached ── */
var geoDone = false;
function growSpecs(){
  if (geoDone) return;
  geoDone = true;
  document.querySelectorAll("#geometry .spec").forEach(function(row,i){
    later(function(){
      row.querySelectorAll(".cardmock, .gdim").forEach(function(el){
        el.style.width = el.dataset.w + "%";
      });
    }, 120 + i*150);
  });
}

/* ── reveals, and trigger each module when it is actually seen ── */
var io = new IntersectionObserver(function(en){
  en.forEach(function(x){
    if (!x.isIntersecting) return;
    x.target.classList.add("in");
    if (x.target.id === "dash") fillDash();
    if (x.target.classList.contains("chart")) runSaved();
    if (x.target.classList.contains("payload")) runPayload();
    if (x.target.closest("#geometry")) growSpecs();
    io.unobserve(x.target);
  });
}, {rootMargin:"0px 0px -10% 0px"});

/* ══════════ ROUTER ══════════ */
var homeEl = document.getElementById("home");
var docsEl = document.getElementById("docs");
var landingStarted = false;

function showRoute(){
  var h = location.hash || "#/home";
  var onHome = (h === "#/home" || h === "#/" || h === "");
  homeEl.classList.toggle("on", onHome);
  docsEl.classList.toggle("on", !onHome);
  document.getElementById("navtoggle").style.display = onHome ? "none" : "";

  document.querySelectorAll(".menu a[data-route]").forEach(function(a){
    var want = a.dataset.route === "home" ? onHome : !onHome;
    a.setAttribute("aria-current", want && a.getAttribute("href") === h ? "true" :
                   (a.dataset.route === "home" && onHome ? "true" : "false"));
  });

  if (onHome){
    if (!landingStarted){ landingStarted = true; startLanding(); }
  } else {
    var m = /^#\/([a-z-]+)/.exec(h);
    render(m ? m[1] : "intro");
  }
  window.scrollTo({top:0, behavior:"auto"});
}

/* the landing page's opening sequence, run the first time it is shown */
function startLanding(){
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ document.body.classList.add("lit"); });
  });
  document.querySelectorAll("#home .reveal").forEach(function(el){ io.observe(el); });
}

window.addEventListener("hashchange", showRoute);

/* ══════════ SHARED CHROME ══════════ */
var bar = document.getElementById("progress"), ticking = false;
addEventListener("scroll", function(){
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(function(){
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? Math.min(1, scrollY/max)*100 : 0) + "%";
    ticking = false;
  });
}, {passive:true});

var tbtn = document.getElementById("theme");
function sysDark(){ return matchMedia("(prefers-color-scheme: dark)").matches; }
function curTheme(){ return document.documentElement.getAttribute("data-theme") || (sysDark()?"dark":"light"); }
function paintT(){ tbtn.textContent = curTheme()==="dark" ? "Light" : "Dark"; }
tbtn.addEventListener("click", function(){
  document.documentElement.setAttribute("data-theme", curTheme()==="dark" ? "light" : "dark");
  paintT();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintT);
paintT();

document.getElementById("kbdhint").textContent =
  /Mac|iPhone|iPad/.test(navigator.platform) ? "\u2318K" : "Ctrl K";

/* one palette for the whole site: the landing page, every docs page,
   and the sections of whichever page is open. */
function paletteEntries(){
  var out = [["Home","Landing","#/home"]];
  GROUPS.forEach(function(g){
    g[1].forEach(function(id){ out.push([PAGES[id].t, g[0], "#/"+id]); });
  });
  var scope = docsEl.classList.contains("on") ? "#docs" : "#home";
  document.querySelectorAll(scope + " h2").forEach(function(h){
    if (!h.id) return;
    out.push([h.textContent.trim(), "On this page", "#"+h.id]);
  });
  return out;
}

function openPalette(){
  if (document.getElementById("pal")) return;
  var items = paletteEntries();
  var back = document.createElement("div");
  back.id = "pal";
  back.style.cssText = "position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.5);"+
    "display:grid;place-items:start center;padding-top:12vh;backdrop-filter:blur(3px)";
  var box = document.createElement("div");
  box.style.cssText = "width:min(560px,92vw);background:var(--p);color:var(--i);"+
    "border:2px solid var(--i);box-shadow:8px 8px 0 var(--a);max-height:70vh;display:flex;flex-direction:column";
  var inp = document.createElement("input");
  inp.placeholder = "Search the documentation\u2026";
  inp.setAttribute("aria-label","Search the documentation");
  inp.style.cssText = "width:100%;padding:.9rem 1rem;border:0;border-bottom:1px solid var(--r);"+
    "background:transparent;color:inherit;font-family:var(--fm);font-size:.95rem;outline:none";
  var list = document.createElement("div");
  list.style.cssText = "overflow-y:auto";
  box.appendChild(inp); box.appendChild(list); back.appendChild(box);
  document.body.appendChild(back);

  var sel = 0, shown = items.slice();
  function paint(){
    list.innerHTML = "";
    if (!shown.length){
      var none = document.createElement("div");
      none.textContent = "No matches.";
      none.style.cssText = "padding:.8rem 1rem;color:var(--m);font-size:.85rem";
      list.appendChild(none); return;
    }
    shown.forEach(function(it,i){
      var r = document.createElement("button");
      r.type = "button";
      r.innerHTML = '<span>'+it[0]+'</span><small style="opacity:.6;margin-left:.6rem">'+it[1]+'</small>';
      r.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;width:100%;"+
        "text-align:left;padding:.55rem 1rem;border:0;cursor:pointer;font-family:var(--fm);font-size:.84rem;"+
        "background:"+(i===sel?"var(--a)":"transparent")+";color:"+(i===sel?"var(--ai)":"var(--i)");
      r.addEventListener("click", function(){ go(it[2]); });
      r.addEventListener("mousemove", function(){ sel=i; paint(); });
      list.appendChild(r);
    });
  }
  function go(h){
    close();
    if (h.indexOf("#/") === 0){ location.hash = h; return; }
    var el = document.querySelector(h);
    if (el) el.scrollIntoView({behavior: REDUCED?"auto":"smooth"});
  }
  function close(){ back.remove(); document.removeEventListener("keydown", key); }
  function key(e){
    if (e.key === "Escape"){ e.preventDefault(); close(); }
    else if (e.key === "ArrowDown"){ e.preventDefault(); sel=(sel+1)%shown.length; paint(); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); sel=(sel-1+shown.length)%shown.length; paint(); }
    else if (e.key === "Enter"){ e.preventDefault(); if (shown[sel]) go(shown[sel][2]); }
  }
  inp.addEventListener("input", function(){
    var q = inp.value.toLowerCase();
    shown = items.filter(function(it){ return (it[0]+" "+it[1]).toLowerCase().indexOf(q) > -1; });
    sel = 0; paint();
  });
  back.addEventListener("click", function(e){ if (e.target === back) close(); });
  document.addEventListener("keydown", key);
  paint(); inp.focus();
}
document.getElementById("openk").addEventListener("click", openPalette);
document.addEventListener("keydown", function(e){
  var tag = (e.target.tagName||"").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); openPalette(); }
  else if (e.key === "/" && !e.metaKey && !e.ctrlKey){ e.preventDefault(); openPalette(); }
});

showRoute();
})();
