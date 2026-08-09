export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "5-aim-habits-killing-your-kd",
    title: "5 Aim Habits That Are Killing Your K/D in Black Ops 7",
    excerpt:
      "Most players think they have 'bad aim.' The truth? It's usually 2-3 specific bad habits that are tanking your gunfight win rate. Here's what our AI coaching data shows are the most common aim mistakes in ranked play.",
    date: "2026-03-05",
    readTime: "7 min read",
    tags: ["aim", "ranked play", "tips"],
    content: `## Your Aim Isn't Bad — Your Habits Are

After analyzing thousands of VODs through our AI coaching system, we've identified the five most common aim-related habits that are costing players gunfights in Black Ops 7 ranked play. The good news? Every single one of them is fixable.

### 1. Ground-Level Crosshair Placement

**The problem:** You're running around with your crosshair aimed at the floor or at knee level. When an enemy appears, you have to flick UP to their body/head before you can start doing damage. That's 100-200ms of wasted time — which is the difference between winning and losing a gunfight.

**The fix:** Consciously keep your crosshair at head/upper-chest level at ALL times. Pre-aim common angles as you move. Your crosshair should be at the height where enemies will appear, not where your feet are.

**How to practice:** Load into a private match on any map. Walk through it slowly and keep your crosshair at head height on every corner and angle. Do this for 10 minutes before your first ranked game. It should become muscle memory.

### 2. Not Pre-Aiming Common Angles

**The problem:** You're turning corners with your crosshair centered on the wall or doorframe instead of where an enemy would be standing. This means you react TO the enemy instead of being ready FOR them.

**The fix:** Learn the common holding spots on every map. When you approach a corner, your crosshair should already be aimed at where someone would be standing. If someone IS there, you're already on target.

### 3. Over-Correcting During Recoil

**The problem:** When you start shooting, the gun kicks up. You pull down too hard to compensate, and your shots go below the target. Then you pull back up, and you're oscillating above and below instead of staying on target.

**The fix:** Learn each weapon's recoil pattern in a private match. Pull down GRADUALLY — most weapons need a slow, steady pull-down, not a sharp jerk. Start with the meta ARs and learn their patterns first.

### 4. Tracking With Full Sensitivity Swipes

**The problem:** When an enemy strafes, you try to track them with big sweeping motions. This causes you to overshoot left and right, constantly crossing over the target without staying on them.

**The fix:** Use micro-adjustments. Small, controlled movements to stay on target. If you find you can't track smoothly, your sensitivity might be too high. Most pro players use relatively low sensitivity for a reason.

### 5. Panic Spraying on Multi-Kills

**The problem:** You get the first kill, see a second enemy, and immediately full-spray without resetting your aim. Your crosshair is wherever the first kill ended, not on the second target.

**The fix:** After every kill, take a beat (even 50ms) to reset your crosshair to the next target before firing. A controlled burst that starts on-target does more damage than a full spray that starts off-target.

---

## The Common Thread

All five of these habits share one root cause: **lack of intentionality.** Great aim isn't about reaction speed or flick ability — it's about setting yourself up so you don't NEED fast reactions. Pre-aim, pre-position your crosshair, control your recoil deliberately, and make every bullet count.

Want to see exactly which of these habits YOU have? [Upload your VOD](/upload) and our AI coach will identify your specific aim issues with timestamped feedback.`,
  },
  {
    slug: "positioning-guide-hardpoint-bo7",
    title: "The Complete Positioning Guide for Hardpoint in BO7",
    excerpt:
      "Positioning is the #1 thing separating average players from good ones. This guide breaks down rotation timing, anchor positioning, and power positions for competitive Hardpoint.",
    date: "2026-03-01",
    readTime: "10 min read",
    tags: ["positioning", "hardpoint", "guide"],
    content: `## Why Positioning Wins Hardpoint Games

You can have the best aim on the server and still lose Hardpoint games if your positioning is bad. Here's the truth: in competitive COD, positioning is worth more than gunskill. A player with a 0.9 K/D who holds the right positions will outscore a 1.5 K/D player who runs around like a headless chicken.

### The Three Roles in Hardpoint

**1. The Anchor**
Your job is to set up near the NEXT hardpoint 10-15 seconds before it rotates. You control spawns for your team and ensure you have positioning when the hill goes live.

**2. The Slayer**
You push out from the hill area and take gunfights to keep enemies away. You're creating space, not sitting in the hill.

**3. The Hill Player**
You sit in the hill and accumulate time. You don't push out, you don't chase kills. You rotate INTO the hill when your team has control.

### Rotation Timing

The single biggest mistake in ranked Hardpoint: rotating too late.

- **30 seconds left on the hill:** Your anchor should already be at the next hill
- **15 seconds left:** At least 2 players should be rotating
- **5 seconds left:** Everyone except maybe one player staying to stall should be at the new hill

If you're running TO the new hill when it goes live, you're already late. The enemy is already set up. You're pushing into their pre-aims.

### Power Position Principles

1. **Always have cover on at least one side.** Never stand in the open.
2. **Hold off-angles, not obvious angles.** If everyone holds the same spot, enemies pre-aim it.
3. **Watch the minimap.** If you see red dots behind you, ROTATE. Don't get flanked.
4. **Height advantage wins.** Take the headglitch over the open ground every time.

### Reading Spawns

Spawns in BO7 are anchor-based. Where your teammates are determines where enemies spawn. Key rules:

- If your team controls one side of the map, enemies spawn on the opposite side
- A single player on the "wrong" side can flip spawns for the entire team
- Watch the minimap for teammate positions — they tell you where enemies WILL spawn

---

Upload your Hardpoint gameplay and [get a full positioning review](/upload). Our AI coach will identify every moment where you were out of position and tell you exactly where you should have been.`,
  },
  {
    slug: "ego-challs-costing-you-games",
    title: "Ego Challs Are Costing You Games — Here's How to Stop",
    excerpt:
      "Every ranked player does it. You know you shouldn't re-peek that angle, but you do it anyway. Here's the psychology behind ego challenges and how to break the habit.",
    date: "2026-02-25",
    readTime: "6 min read",
    tags: ["decision-making", "ranked play", "mindset"],
    content: `## What Is an Ego Chall?

An ego chall (ego challenge) is when you take a gunfight you know you shouldn't take because your ego tells you that you can win it. The most common example: you peek an angle, get shot first, duck back behind cover — and then immediately re-peek the same angle.

The enemy is already aimed at where you were. They're expecting you to re-peek. And you do it anyway.

### Why You Ego Chall

1. **"I can win this."** Your brain tells you that you're better than them. Maybe you are. But they have the advantage right now.
2. **Tilt.** You're frustrated that they shot you first. You want to "prove" yourself.
3. **No alternative plan.** You don't know what else to do, so you default to fighting.
4. **Time pressure.** In objective modes, you feel like you need to get the kill NOW.

### The Math Against You

When you re-peek an angle where someone is already aiming:
- They need ~0ms to react (they're already aimed)
- You need ~200ms to process, aim, and fire
- That's a 200ms disadvantage before you even account for aim

Even if your aim is better, you're starting 200ms behind. That's nearly half a TTK in BO7. You're dead before your bullets connect.

### How to Break the Habit

**Rule 1: If you get shot off an angle, do NOT re-peek it.** Find a different angle or rotate.

**Rule 2: Count to 2.** When you get cracked off a position, count "one, two" before making a decision. Those 2 seconds let your brain override the ego response.

**Rule 3: Have a fallback plan.** Before you peek ANY angle, know where you'll go if you get shot. If you don't have a fallback, you shouldn't be peeking.

**Rule 4: Record yourself and watch it back.** You'll be shocked at how many ego challs you take without realizing it. Our [VOD analyzer](/upload) flags every single ego chall with timestamps.

### The Pro Mindset

Pro players don't ego chall because they understand that staying alive is worth more than getting a kill. A dead player can't hold the hill, can't anchor spawns, can't make callouts.

The best player on the server isn't the one with the most kills — it's the one who dies the least while still contributing. Every ego chall death is a contribution you're NOT making.

---

Want to know exactly how many ego challs you take per game? [Upload your VOD](/upload) and find out.`,
  },
  {
    slug: "best-sensitivity-settings-bo7",
    title: "Finding Your Perfect Sensitivity in Black Ops 7",
    excerpt:
      "Too high and you over-aim. Too low and you can't track. Here's a systematic approach to dialing in your sensitivity for competitive play.",
    date: "2026-02-20",
    readTime: "8 min read",
    tags: ["settings", "aim", "guide"],
    content: `## Why Sensitivity Matters

Your sensitivity setting is the foundation of your aim. Everything else — crosshair placement, tracking, flick shots — is built on top of it. If your sensitivity is wrong, you're fighting your own settings every gunfight.

### The Goldilocks Zone

Most competitive players use sensitivities in the 5-7 range (on a 1-20 scale) with standard stick settings. Here's why:

- **Too high (8+):** You overshoot targets, can't track moving enemies smoothly, and your micro-adjustments are too large
- **Too low (1-4):** You can't turn on people behind you, slow rotations cost you gunfights, and aggressive movement is limited
- **Sweet spot (5-7):** Enough precision for gunfights, enough speed for movement

### How to Find Your Sensitivity

**Step 1: Start at 6/6 (Horizontal/Vertical)**
This is a neutral starting point used by many pros.

**Step 2: Load into a private match with bots**
Play 10 minutes and pay attention to:
- Are you overshooting targets? → Lower it
- Are you undershooting / can't keep up? → Raise it
- Can you smoothly track a strafing bot? → You're close

**Step 3: Adjust by 1 at a time**
Never jump more than 1 point. Play a full game at each setting before deciding.

**Step 4: Separate H and V if needed**
Some players prefer slightly lower vertical (e.g., 6H/5V) since most engagements are horizontal.

### ADS Sensitivity Multiplier

This is often overlooked. The ADS (aim-down-sights) multiplier adjusts your sensitivity while zoomed in.

- **0.75-0.85:** Good for AR/LMG players who want precise long-range shots
- **0.90-1.00:** Good for SMG players who need quick target acquisition
- **1.00+:** Very aggressive, only for players with exceptional control

### The Pros' Settings

Most CDL pros use sensitivities between 5-7 with:
- Linear or Dynamic aim response curve
- 0.80-1.00 ADS multiplier
- No aim assist adjustments (standard AA)

### Don't Change During a Session

Pick a sensitivity and commit to it for at least a week. Your muscle memory needs time to adjust. Changing mid-session is the worst thing you can do.

---

Once you've dialed in your sensitivity, [upload a VOD](/upload) to see how your aim performs in real gunfights. Our analyzer will tell you if your settings are working for you or against you.`,
  },
  {
    slug: "movement-mechanics-ranked-play",
    title: "Advanced Movement Mechanics for BO7 Ranked Play",
    excerpt:
      "Slides, bunny hops, and strafing — when to use each and how they affect your gunfight win rate. A breakdown of movement in competitive Black Ops 7.",
    date: "2026-02-15",
    readTime: "9 min read",
    tags: ["movement", "mechanics", "ranked play"],
    content: `## Movement Is Your Second Weapon

In Black Ops 7, movement isn't just about getting from A to B — it's an active combat tool. Good movement makes you harder to hit, gives you better angles, and lets you take fights on your terms.

### The Core Mechanics

**Slide Cancel**
The bread and butter of COD movement. Sliding into a cancel lets you move at sprint speed while keeping your gun ready. Use it to:
- Cross open areas quickly
- Break cameras (appear on an enemy's screen later than expected)
- Close distance in SMG fights

**Bunny Hop**
Jumping around corners and during gunfights adds vertical movement that most players struggle to track. Most effective:
- When turning corners where someone might be holding
- During close-range gunfights (SMG range)
- To break aim assist on the enemy's end

**Strafe Shooting**
Moving left-right while in ADS. This is the most important gunfight mechanic in the game:
- Left-right strafing makes you harder to hit while you shoot
- Use unpredictable patterns — don't just go left-right-left-right
- Match your strafe speed to your gun's handling stats

### When NOT to Use Movement

- **Don't slide into a headglitch player.** You're moving into their pre-aim while your accuracy is reduced.
- **Don't bunny hop at long range.** It tanks your accuracy and makes no difference at range.
- **Don't sprint into known enemy positions.** Sprint-out time will get you killed.

### Sprint Management

This is an underrated skill. When to tactical sprint vs. regular sprint vs. walking:

- **Tactical sprint:** Only in safe areas where no enemies are expected
- **Regular sprint:** Moving between positions with low enemy probability
- **Walk/ADS:** Approaching ANY area where an enemy might be

The #1 movement mistake in ranked: sprinting around corners. Sprint-out time means your gun isn't ready for ~200ms after you stop sprinting. That's a free kill for anyone holding the angle.

### Camera-ing

Because of how the game engine works, the person moving around a corner sees the enemy before the enemy sees them. This is called "camera advantage." You can maximize this by:
- Always being the one to swing/peek, not the one to hold
- Using slide or jump when swinging to exaggerate the camera advantage
- Wide swinging instead of tight-peeking (against players of similar skill)

---

Want a detailed breakdown of your movement in-game? [Upload your VOD](/upload) and see exactly where your movement is helping or hurting you.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
