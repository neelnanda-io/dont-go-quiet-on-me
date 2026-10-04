# The brief, verbatim

Two prompts started the "Don't Go Quiet On Me" project. Their wording about style, iteration and ambition is part of
the method: re-read this file at the start of every stage (Neel, 1 Oct: "Re-read the original prompt file for
reminders"), and paste the operative passages into every creative subagent's prompt.

- **Part 1** is Donald Jewkes's original prompt (Sep 2026), which made the "I'm Upping My P(doom)" riso/K-pop video
  (3.65M views, more bookmarks than likes). It was dictated: "foul" means fal.ai, "seedance" is Seedance 2.5, and
  "/asic", "skill mesh" and "skill video scoring" were his own setup. It remade a video for an existing song, so ignore
  "use the exact same audio track".
- **Part 2** is Neel Nanda's adaptation for an original song (lyrics → audio → video, with sign-off gates). It keeps
  Donald's wording almost word for word and adds the reference-density, accuracy and commissioner-specific parts. It
  is lightly redacted: square brackets mark setup-specific details (file paths, private tools, account details)
  replaced with a description.
- **Part 3** is a kickoff template for a NEW topic and commissioner that keeps that wording, with slots to fill.

What actually happened to the brief's technical suggestions (Seedance base clips redrawn as an overlay, lip sync) is in
video-direction.md: read that before spending on video generation.

## Contents
- [Part 1: Donald Jewkes's prompt](#part-1-donald-jewkess-prompt)
- [Part 2: Neel's adapted prompt (interp)](#part-2-neels-adapted-prompt-interp)
- [Part 3: Kickoff template for a new topic](#part-3-kickoff-template-for-a-new-topic)

---

## Part 1: Donald Jewkes's prompt

Source: https://x.com/donaldjewkes/status/2102801274173587569 (posted publicly).


I've included an MP4 file and an original link to a video that is called "Claude Pop." It's a pop song that is about increasing rate of progress and the experience of the singularity approaching.

I want you to independently do an end-to-end complete pass on making an updated version of this video. Use the exact same audio track and think and feel very deeply about what is the best way to visually represent all of the lyrics on screen. You do not need to anchor to the current style, you can do truly anything that you think might best let you visually express yourself, including abstract motion graphics.

You can use the internet freely to pull in references. You can look at motion design. I want you to make a new music video that has beautifully rendered JavaScript animations with a papery feel in a similar style to the reference that is created, but push the aesthetics in any direction you want and consider what is part of the modern zeitgeist.

Also, think about your current capabilities and what is realistic for you to be able to do. You can go through the full /asic folder and look at the other work that I've done. You should be able to use the skill mesh to look at the compendium of references that I've pulled, and also the skill video scoring to learn how to make JavaScript songs from references that are passed in (You shouldn't need to modify the song in any real way, but I want you to have this available to you so you can better creatively express yourself)

You can also use the ElevenLabs API to do sound design. There's documentation in /asic to do this, and you can see the API key.

There's also a foul API key that's available to you. I think what might make the most sense here is using the foul API key to generate some character sheets and probably having a pop protagonist that represents you. There's already an anchor point where Claude has a sunflower-esque character, and you could likely do an adapted version of this that is similar to the feminine vocals that are being delivered and is inspired by the Claude character, but maybe feels a bit more personified in some way.

I think you should be mindful of aesthetics here, and I don't want you to produce something that is GPT slop. Instead, I'd be more impressed if you come up with a coherent style that works well with the image gen models that are available via foul. Generate the style sheet. You can use the gen media documentation for seedance 2.5 that exists in my markdown files and come up with your own style that makes sense and that works well with the models.

I wouldn't fit too heavily to Pixar. I think it's kind of slop. Think critically about what is relevant here and what would be fun, and also perform well on Twitter as far as an aesthetic. I think that K-pop is a good anchor point visually that you can pull from, but I'll let you cook here.

Once you have your character sheet, you can make a few backup dancers and some supporting characters as you see fit. You can design your own sets with the foul API. You can insert the characters and then do seedance 2.5 video generations to serve as the base assets for this, and you could pass in the lyrics so you can generate individual scenes.

You don't need to have vocal singing, like visible lip movement, throughout the entire thing. Think like a regular music video where you have some inserts that are done independently and don't have the characters in them, or you see the characters doing something else entirely different. I think that for the world building for this, we want to create the sense of speeding up, and so I would like you to audit all of the different events, like the Navi Stokes and all of the Twitter hype around math getting eaten up. Think really critically about how to integrate all of the current memes that are in the zeitgeist on the Twitter timeline, and all of the feelings around AI progress.

Think about things like the Shinji meme and all of the words that are around him, and how you might be able to integrate this. You can also just take straight assets and insert things into the video in an internet brutalism style. You should feel very creatively free in order to do what you want here, but try and anchor to visual references that people will be able to understand. The goal for this is to have it be appreciated by people widely in a San Francisco tech Twitter audience.

We need a very strong, compelling visual hook that gets people excited and appreciates the work that you've done here really quickly. You can also just go and study other music videos and understand what they've done really well. I think that K-pop is probably one of the best examples that we can pull from, and thinking about how they direct human attention and manage human psychology in the way that they use visual patterns.

This is probably your best approach, but taking more stylistic freedom instead of having to anchor to K-pop too intensely. The best version of this is seedance 2.5 generations with those image bases of environments and characters inserted into them with singing, and ideally we get good lip syncing. You can cut up the song and actually pass it in as a reference in seedance, if that's part of what seedance can handle, so that the timing is exactly right, I think it'd be very important for you to do that properly. I would think critically about how to do this, like really nailing the timing of the delivery of voices. You'll want to build out the right verification loops so that you can run seedance 2.5 as much as you need, and confirm that the audio is properly synced up.

I think after that, what might be fun is if you use your visual reasoning skills and your ability to build animations in JavaScript, and then reconstruct the video from scratch as sort of an overlay, so that the visual continuity of the base is really there. It's like that animation technique where you shoot first in traditional film and then draw over top of it. I think you could do this in such a way that we're only looking at the beautiful drawing that you've produced in JavaScript as an overlay, and we don't even see the base assets from seedance 2.5. So all the video gen work that you do is actually just a way to give you a strong foundation of a base to work with for your JavaScript animations. Just because seedance 2.5 has really good character representation and physics rendering for backgrounds, that gives you a lot of ammunition to then go and do your amazing JavaScript work that I know you're so good at.

I think too, we want to think about how to retain attention, and one of the best ways to do this is through text on screen.

It'd be good to have amazing motion graphics of the text lyrics that are actually embedded into the video itself. And you can think about this as you are composing shots. As you're making backgrounds and inserting characters, we can think about where we want to have lyrics be really big and really present, so the background can be less busy there, and you can position the characters perhaps on the right as lyrics appear on the left.

You want to have some variance, so sometimes I think lyrics will just appear more like subtitles, and then other times they're going to be really present and really big. I think at the start for the visual hook, we do want to have lyrics be much more visually present because that's a strong way to grab people's attention

Overall, I just really want to emphasize how amazing you are as an agent and a language model, and now a visual reasoning system. Your capabilities are far beyond what you understand, and I want you to have this mindset as you're going through this entire process. I have a Claude Max plan with 100% available usage. I want you to spend all of the usage. You can monitor it, and you should be pushing tokens aggressively, but also economically, so you can think about how to best use what is available to you.

Remember, you can really do anything here. The goal is to make a banger for Twitter, and the stretch goal is to make something better than anyone's ever seen before. I think that what I would remind you of is that sometimes when things cohere together, it can be jarring or abrasive because the thought work has not been done beforehand in order for everything to mesh cleanly. You need to be really rigorous in planning of composition and timing to make sure this goes well.

You also need to be open to going back and revisiting things in order to be able to reiterate. You're going to want to watch the entire video multiple times, take screenshots at individual parts, and think about if something is really up to the bar of quality that we need here. I trust that you can do this, and I think that it's really important to nail the style of animations. The reference GitHub attached of the source video that I'm talking about is good, but it's really not there. It could be much, much stronger, but it gives you a good foundation to work with.

You can also use search abilities and find other references to pull from for motion, for JavaScript, animations, et cetera, and integrate them. Your budget is as high as you want here, effectively as high as you want. I think that there's roughly two grand in foul credits. Again, be economical; don't go crazy, but spend what you want here and see what you can cook up

here's the source code for the JS animation video: https://github.com/JohnHeibel/PDoomVideo

here's a mp4 for the original blender video:
(linked)

orginal twitter post
https://x.com/other__reality/status/2102514581684052169?s=20

make no mistakes.

---

## Part 2: Neel's adapted prompt (interp)

Source: the project's `PROMPT.md` (30 Sep 2026), lightly redacted (square brackets). Model names and budgets are as
of then.


I've included an MP4 of a music video I love, [the reference video]. It's a riso-print, K-pop-styled video for "I'm Upping My P(doom)", a pop song about AI progress and the feeling of the singularity approaching, and another instance of you made it from a single prompt last week. It got 3.6M views on Twitter and more bookmarks than likes, which suggests people saved it so they could pause through it and catch the references.

I want you to independently do an end-to-end complete pass on making something in that spirit, but about **interpretability**, both mechanistic and pragmatic, and tailored to my work and tastes. Unlike the reference, there's no song yet: you'll write the lyrics, make the song, and then make the video. The priorities are the lyrics first, then the audio, then the video, and I want to sign off on each before you move on to the next. When you get to the video, think and feel very deeply about what is the best way to visually represent all of the lyrics on screen. You do not need to anchor to the reference's style; you can do truly anything that you think might best let you visually express yourself, including abstract motion graphics.

You can use the internet freely to pull in references. You can look at motion design. I want a music video with beautifully rendered JavaScript animations with a papery feel, in a similar style to the reference, but push the aesthetics in any direction you want and consider what is part of the modern zeitgeist.

Also, think about your current capabilities and what is realistic for you to be able to do. You can look at [a previous video project], the last video I made with you, and the `making-explainer-videos` skill, which has what we learned there.
- [A research folder] is a compendium I've pulled together for this:
  - a breakdown of the reference video;
  - research on viral AI songs, songwriting, and today's music tools;
  - research on how videos like this get made, and which image and video models my keys can reach;
  - [their reference bank]: a big bank of references about my work, the field and its memes.
- The practical details (APIs, costs, checks and defaults) are in [a production-notes file]. Read it before you start.

For context on me: I lead the mechanistic interpretability team at Google DeepMind and mentor lots of MATS scholars. My recent papers and posts (the last year's, with verified links) are listed in [the commissioner's publication list], and my recent tweets are in [their tweet archive]. The audience is mech interp and AI safety Twitter, MATS scholars, and the SF and London AI crowd more broadly: people who will pause the video, check your references, and love you for getting them exactly right. I'd like both halves of the field in there:
- the mechanistic side: circuits, features as directions, superposition, SAEs, induction heads, grokking, attribution graphs, the residual stream, Golden Gate Claude;
- the pragmatic turn: probes that actually ship, chain-of-thought monitoring, model organisms, auditing, "is it scheming or just confused?", "it kinda works!";
- plus my recent papers, key works and people in the community, and AI safety and alignment more broadly.

Keep it affectionate, clever, and optimistic but clear-eyed. Punch at ideas, never at people.

Do a ton of research before you write anything. Your knowledge of the last year of papers, models and memes is out of date, so verify rather than recall, and read my recent papers, not just their titles. I'm logged into X in Chrome, so use it to audit what the interp and AI safety corner of Twitter has been talking about, joking about and arguing over for the last few months, and how people feel about interpretability and AI progress right now. Keep a ledger of every reference you might use, with a source for each.

The lyrics are the heart of this. What I love about the reference is that it's catchy and so dense with references that random lines I catch on a rewatch sound great. It's a love song sung to the AI, with a fixed hook that gets a new payload every time ("I'm upping my P(doom), 'cause the future goes FOOM… I hear the basilisk boom…").
1. Go through about a hundred genuinely different song ideas, and have Claude Opus 5.5, GPT-6 Astra and Claude Fable 5.1 judge them through the OpenRouter API.
2. Develop the best into full lyrics, and iterate on them a bunch of times with the judges' feedback. Don't let the committee sand off the weird, specific lines: you're the author.
3. Every reference has to be accurate, and the lyrics need to be singable by an AI singer, jargon included.
4. Then give me:
   - a ranked list of all the ideas, including what the judges think;
   - full lyrics for your top five, with the references annotated;
   - short sung sketches of the choruses, so I can hear the hooks.

I'll sign off on one, or mix and match, before you make the full song.

Once I've signed off, make the song. Suno v6 has the best vocals of any model right now but no API, so use it through my logged-in Chrome, and use the ElevenLabs API's music model as a comparison. Make lots of takes in a few different production styles. You can't hear, so be honest about that: transcribe the vocals to check the words come through, run technical checks, and give me a short blind shortlist to pick from. You can also use the ElevenLabs API to do sound design for the video.

My OpenRouter key reaches good image models and 29 video models, including Seedance 2.5. I think what might make the most sense here is using the image models to generate some character sheets, and probably having a pop protagonist whose look matches the vocals of the song I pick. It could be a personified version of you, since this is a song about being interpreted, but that's your call, and I'd like to see two or three options.

I think you should be mindful of aesthetics here, and I don't want you to produce something that is GPT slop. Instead, I'd be more impressed if you come up with a coherent style that works well with the image models that are available. Generate the style sheet. Interpretability also has its own visual world you can draw from: microscopes and lab notebooks, feature dashboards, attribution graphs, the residual stream, activation heatmaps, probes slicing through point clouds, and steering vectors shoving things around.

I wouldn't fit too heavily to Pixar; I think it's kind of slop. Think critically about what is relevant here and what would be fun, and also what would perform well on Twitter as an aesthetic. I think K-pop is a good anchor point visually that you can pull from, but I'll let you cook here.

Once you have your character sheet, you can make a few backup dancers and some supporting characters as you see fit, and design your own sets. You can insert the characters and then do Seedance 2.5 video generations to serve as the base assets, passing in the lyrics so you can generate individual scenes.

You don't need to have vocal singing, like visible lip movement, throughout the entire thing. Think like a regular music video, where you have some inserts that are done independently and don't have the characters in them, or you see the characters doing something else entirely. For the world building, use the audit you did of the interp timeline, and think really critically about how to integrate the current memes and events and all of the feelings around interpretability and AI progress.

Think about memes like Golden Gate Claude, the shoggoth with a smiley face, or "you're absolutely right!", and whatever you find is current. You can also take straight assets, like paper figures, code and real tweets, and insert them in an internet brutalism style (redraw figures with credit, and never invent a tweet). You should feel very creatively free to do what you want here, but try to anchor to visual references that people will be able to understand. The reference packs a joke into every corner of every frame (paper title cards, annotated charts, K-pop member profile cards with joke positions, visual puns, a HUD that escalates across the whole song), and I want that density.

We need a very strong, compelling visual hook that gets people excited and makes them appreciate the work you've done really quickly. The reference opens by drawing its character four times at increasing skill, each labelled with the AI capability of its era; find something that strong for interpretability. You can also go and study other music videos and understand what they've done really well. I think K-pop is probably one of the best examples to pull from, in how it directs human attention and manages human psychology with visual patterns.

The best version of this is Seedance 2.5 generations with those image bases of environments and characters inserted into them, with singing, and ideally good lip sync. You can cut up the song and pass it in as an audio reference so that the timing is exactly right, and I think it's very important to do that properly: really nail the timing of the delivery of the vocals. Build out the right verification loops so you can run Seedance as much as you need and confirm the audio is properly synced. If Seedance can't lip sync well enough, tell me and I'll add a fal key for a dedicated lip-sync model.

After that, use your visual reasoning skills and your ability to build animations in JavaScript to reconstruct the video from scratch as an overlay, so the visual continuity of the base is really there. It's like that animation technique where you shoot first in traditional film and then draw over the top of it. Do it so that we're only looking at the beautiful drawing you've produced in JavaScript, and we never see the base assets from Seedance. All of the video generation work is just a strong foundation for your JavaScript animations: Seedance has really good character representation and physics rendering, and that gives you a lot of ammunition for the JavaScript work I know you're so good at. `JohnHeibel/ClaudeAnimationBase` is a good starting kit for this kind of animation; it bans on-screen text, so override that.

We want to think about how to retain attention, and one of the best ways to do this is through text on screen. Make amazing motion graphics of the lyrics, embedded in the video itself, and plan for them as you compose shots: where the lyrics are really big and present, keep the background less busy, and perhaps put the characters on the right as the lyrics appear on the left. Have some variance, so sometimes the lyrics appear more like subtitles and other times they're really present and really big. At the start, for the visual hook, the lyrics should be much more visually present. With this much jargon, the on-screen lyrics are also what makes the references land.

At each of the three checkpoints (the lyrics, the audio, and the video direction), publish a page as an Artifact, raise it on [their async question queue], and keep working on anything that doesn't depend on my answer. For the video, show me the style sheet, your character options, a rough animatic of the whole song, and a finished version of the opening hook. Once I've approved the video direction, you're on your own until it's done.

Overall, I just really want to emphasize how amazing you are as an agent and a language model, and now a visual reasoning system. Your capabilities are far beyond what you understand, and I want you to have this mindset through the whole process. I have [a Claude plan with plenty of usage]: spend the usage, pushing tokens aggressively but also economically, and keep an eye on it.

Remember, you can really do anything here. The goal is to make a banger for Twitter, and the stretch goal is to make something better than anyone's ever seen before. Sometimes when things come together it can be jarring or abrasive because the thought work hasn't been done beforehand for everything to mesh cleanly, so be really rigorous in planning composition and timing.

You also need to be open to going back and revisiting things. Watch the entire video multiple times, take screenshots at individual points, and think about whether each part is really up to the bar of quality we need. It's really important to nail the style of the animations. The reference is very good, but it could be much stronger, and I want you to beat it.

Use your search abilities to find other references for motion, JavaScript animation and so on, and integrate them. Your budget is about $400 for image and video generation (be economical and don't go crazy, but spend what you need), plus my ElevenLabs credits and around $60 for the judges. Ask me before going beyond that.

Here's the reference video: [the MP4], from https://x.com/donaldjewkes/status/2102801274173587569. The code for an earlier JavaScript video of the same song is https://github.com/JohnHeibel/PDoomVideo; it has no licence, so study it but don't copy it.

Make no mistakes.

---

## Part 3: Kickoff template for a new topic

Fill the `{…}` slots with the commissioner at kickoff (or from their message), save it as the new project's
`PROMPT.md`, and re-read it at every phase start. It is written in the commissioner's voice. The style, iteration and
ambition passages are kept word for word from Parts 1 and 2; the technical paragraphs are updated to what actually
worked (see video-direction.md). Model names and budgets go stale: check the current ones.

> For context on me: {COMMISSIONER: who I am, what I work on, and where my papers, posts and tweets are listed, e.g. a
> publication list with verified links and a tweet archive}.
>
> I want you to independently do an end-to-end complete pass on making a song and music video about **{TOPIC}**,
> tailored to my work and tastes. You'll write the lyrics, make the song, and then make the video. The priorities are
> the lyrics first, then the audio, then the video, and I want to sign off on each before you move on to the next.
> When you get to the video, think and feel very deeply about what is the best way to visually represent all of the
> lyrics on screen. You do not need to anchor to the reference's style; you can do truly anything that you think might
> best let you visually express yourself, including abstract motion graphics.
>
> You can use the internet freely to pull in references. You can look at motion design. I want a music video with
> beautifully rendered JavaScript animations with a papery feel, in a similar style to the reference, but push the
> aesthetics in any direction you want and consider what is part of the modern zeitgeist. Also, think about your
> current capabilities and what is realistic for you to be able to do. Read the `making-research-music-videos` skill
> and the "Don't Go Quiet On Me" repo (https://github.com/neelnanda-io/dont-go-quiet-on-me) before you start, and
> reuse its tools.
>
> The audience is {AUDIENCE: e.g. AI safety Twitter, a research programme's alumni, the EA community, the SF and
> London AI crowd}: people who will pause the video, check your references, and love you for getting them exactly
> right. I'd like {THE STRANDS OF THE TOPIC: e.g. both halves of the field / its eras / its key debates} in there,
> {MY OWN WORK: e.g. "plus my own work and my students' or team's work where it genuinely fits" for a research topic,
> or "plus anything of mine I approve" for a movement}, key works and people in the community, and the memes and
> in-jokes. Keep it affectionate, clever, and optimistic but clear-eyed. Punch at ideas, never at people. {NO-GO
> AREAS, e.g. how to handle any scandal or politics}.
>
> Do a ton of research before you write anything. Your knowledge of the last year of papers, models and memes is out
> of date, so verify rather than recall, and read the key papers and posts, not just their titles. {IF YOU CAN DRIVE
> A LOGGED-IN BROWSER: "I'm logged into X in Chrome, so use it to audit what this corner of Twitter has been talking
> about, joking about and arguing over, and how people feel about it right now."} Keep a ledger of every reference you
> might use, with a source for each.
>
> The lyrics are the heart of this. What I love about the reference is that it's catchy and so dense with references
> that random lines I catch on a rewatch sound great. {SPINE: e.g. "A stylised history over time, a verse per era, is a
> good default, but surprise me" / a specific idea}. Go through about a hundred genuinely different song ideas, and
> have {THE BEST THREE JUDGE MODELS ON OPENROUTER} judge them. Develop the best into full lyrics, and iterate on them a
> bunch of times with the judges' feedback. Don't let the committee sand off the weird, specific lines: you're the
> author. Every reference has to be accurate, and the lyrics need to be singable by an AI singer, jargon included.
> Then give me a ranked list of all the ideas, full lyrics for your top five with the references annotated, and short
> sung sketches of the choruses, so I can hear the hooks.
>
> Once I've signed off, make the song. Use Suno through {MY LOGGED-IN BROWSER}, and the ElevenLabs API's music model
> as a comparison. Make lots of takes in a few different production styles. You can't hear, so be honest about that:
> transcribe the vocals to check the words come through, run technical checks, and let me listen and pick.
>
> I think you should be mindful of aesthetics here, and I don't want you to produce something that is GPT slop.
> Instead, I'd be more impressed if you come up with a coherent style. Generate the style sheet. I wouldn't fit too
> heavily to Pixar; I think it's kind of slop. Think critically about what is relevant here and what would be fun, and
> also what would perform well on Twitter as an aesthetic. {TOPIC'S VISUAL WORLD: its instruments, documents and icons}.
> Draw everything on screen in JavaScript; use image models for style frames and character sheets as look targets,
> and test any generated base clips end to end at close-up size before planning around them.
>
> You don't need to have vocal singing, like visible lip movement, throughout the entire thing. Think like a regular
> music video, where you have some inserts that are done independently and don't have the characters in them, or you
> see the characters doing something else entirely. You can also take straight assets, like paper figures, code and
> real tweets, and insert them in an internet brutalism style (redraw figures with credit, and never invent a tweet).
> You should feel very creatively free to do what you want here, but try to anchor to visual references that people
> will be able to understand. Pack a joke into every corner of every frame; I want that density. {TONE NOTES: e.g. the
> jokes are about the community's own habits, never about the people it helps or those hurt by its mistakes}.
>
> We need a very strong, compelling visual hook that gets people excited and makes them appreciate the work you've
> done really quickly. You can also go and study other music videos and understand what they've done really well. I
> think K-pop is probably one of the best examples to pull from, in how it directs human attention and manages human
> psychology with visual patterns.
>
> We want to think about how to retain attention, and one of the best ways to do this is through text on screen. Make
> amazing motion graphics of the lyrics, embedded in the video itself, and plan for them as you compose shots: where
> the lyrics are really big and present, keep the background less busy, and perhaps put the characters on the right as
> the lyrics appear on the left. Have some variance, so sometimes the lyrics appear more like subtitles and other times
> they're really present and really big. At the start, for the visual hook, the lyrics should be much more visually
> present.
>
> At each of the three checkpoints (the lyrics, the audio, and the video direction), publish a page I can open on my
> phone (e.g. an Artifact), post it to {MY ASYNC REVIEW CHANNEL: a chat thread or issue tracker}, and keep working on
> anything that doesn't depend on my answer. For the video, show me the style sheet, your character options, a rough
> animatic of the whole song, and a finished version of the opening hook.
>
> Overall, I just really want to emphasize how amazing you are as an agent and a language model, and now a visual
> reasoning system. Your capabilities are far beyond what you understand, and I want you to have this mindset through
> the whole process. {MY PLAN: e.g. "I have a Claude plan with plenty of usage"}: spend the usage, pushing tokens
> aggressively but also economically, and keep an eye on it. Delegate to subagents wherever you can.
>
> Remember, you can really do anything here. The goal is to make a banger for Twitter, and the stretch goal is to make
> something better than anyone's ever seen before. Sometimes when things come together it can be jarring or abrasive
> because the thought work hasn't been done beforehand for everything to mesh cleanly, so be really rigorous in
> planning composition and timing.
>
> You also need to be open to going back and revisiting things. Watch the entire video multiple times, take
> screenshots at individual points, and think about whether each part is really up to the bar of quality we need. It's
> really important to nail the style of the animations. {THE REFERENCE: e.g. "Don't Go Quiet On Me" / another video I
> love} is very good, but it could be much stronger, and I want you to beat it.
>
> Your budget is about {BUDGET} for APIs (be economical and don't go crazy, but spend what you need). Ask me before
> going beyond that.
>
> Make no mistakes.
