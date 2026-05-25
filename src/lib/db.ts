import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'beesauce.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  fs.mkdirSync(DB_DIR, { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  migrate(_db)
  return _db
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      slug      TEXT UNIQUE NOT NULL,
      title     TEXT NOT NULL,
      date      TEXT NOT NULL,
      excerpt   TEXT NOT NULL DEFAULT '',
      content   TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_inventory (
      product_id TEXT PRIMARY KEY,
      stock      INTEGER NOT NULL DEFAULT 0,
      price      INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       INTEGER NOT NULL DEFAULT 0,
      category    TEXT NOT NULL DEFAULT 'other',
      image       TEXT NOT NULL DEFAULT '',
      featured    INTEGER NOT NULL DEFAULT 0,
      home_slot   INTEGER,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             TEXT PRIMARY KEY,
      created_at     TEXT NOT NULL,
      customer_email TEXT NOT NULL DEFAULT '',
      customer_name  TEXT NOT NULL DEFAULT '',
      amount_total   INTEGER NOT NULL DEFAULT 0,
      status         TEXT NOT NULL DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     TEXT NOT NULL REFERENCES orders(id),
      product_id   TEXT NOT NULL DEFAULT '',
      product_name TEXT NOT NULL DEFAULT '',
      quantity     INTEGER NOT NULL DEFAULT 1,
      unit_price   INTEGER NOT NULL DEFAULT 0,
      amount       INTEGER NOT NULL DEFAULT 0
    );
  `)
  // Add price column to existing DBs that don't have it yet
  try {
    db.exec('ALTER TABLE product_inventory ADD COLUMN price INTEGER NOT NULL DEFAULT 0')
  } catch {
    // Column already exists — ignore
  }
  // Add published column to existing DBs that don't have it yet
  try {
    db.exec('ALTER TABLE product_inventory ADD COLUMN published INTEGER NOT NULL DEFAULT 1')
  } catch {
    // Column already exists — ignore
  }
  // Add home_slot column to existing DBs that don't have it yet
  try {
    db.exec('ALTER TABLE custom_products ADD COLUMN home_slot INTEGER')
  } catch {
    // Column already exists — ignore
  }
  seedBlogPosts(db)
  seedInventory(db)
  seedCustomProducts(db)
}

function seedCustomProducts(db: Database.Database) {
  const seeds = [
    { id: '1', name: 'Raw Wildflower Honey', slug: 'raw-wildflower-honey', description: 'Pure raw honey harvested from our local hives. Unfiltered, unheated, and packed with natural enzymes and pollen. Each jar reflects the unique floral character of the season.', price: 1400, category: 'honey', image: '/products/wildflower-honey.jpg', featured: 1 },
    { id: '3', name: 'Lip Balm', slug: 'lip-balm', description: 'Natural lip balm made with 100% pure beeswax and oils. Deeply moisturizing and apiary crafted.', price: 500, category: 'lip-balm', image: '/products/lip-balm.jpg', featured: 1 },
    { id: '4', name: 'Honey & Oat Bath Bomb', slug: 'honey-oat-bath-bomb', description: 'Fizzing bath bomb infused with honey and colloidal oatmeal for a soothing, skin-softening soak.', price: 700, category: 'bath-bombs', image: '/products/bath-bomb.jpg', featured: 0 },
    { id: '5', name: 'Beeswax Candle', slug: 'beeswax-candle', description: 'Hand-poured 100% pure beeswax candle with a natural honey scent. Burns clean and long.', price: 1800, category: 'other', image: '/products/beeswax-candle.jpg', featured: 0 },
    { id: '6', name: 'Honey Soap', slug: 'honey-soap', description: 'Handcrafted bar soap made with raw honey and beeswax. Gently cleanses and leaves skin soft and moisturized.', price: 800, category: 'soap', image: '/products/soap.jpg', featured: 1 },
  ]

  // INSERT OR IGNORE — safe to run every boot; skips rows whose id already exists
  const insert = db.prepare(`
    INSERT OR IGNORE INTO custom_products (id, name, slug, description, price, category, image, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const s of seeds) {
    insert.run(s.id, s.name, s.slug, s.description, s.price, s.category, s.image, s.featured)
  }
}

function seedBlogPosts(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as n FROM blog_posts').get() as { n: number }).n
  if (count > 0) return

  const posts = [
    {
      slug: 'new-bees-new-style',
      title: 'New Bees, New Style',
      date: '2020-05-26',
      excerpt: 'Leveling hive stands, planting clover, and starting two new colonies at School 46 — a fresh start after a tough season.',
      content: `We faced ongoing challenges keeping our backyard hives level, so we finally tackled it properly. We laid gravel and cinderblocks, threading wooden posts through them for stability.

Next came soil preparation. Initial hand-tilling proved exhausting, so we waited for the electric tiller to finish the job.

The reason for this extensive tilling was strategic: a lawn mower had triggered a bee attack the previous year. By eliminating grass and planting clover instead, we hoped to reduce such incidents — and clover is better for the bees anyway.

We also established two colonies at School 46 for a new Beekeeping Club, sourced from Hungry Bear Farms. We'll be doing inspections every 7–10 days.

One concern worth noting: 2 out of 4 of our hives are currently queenless. We're keeping a close eye on things.`,
    },
    {
      slug: '2019-season-of-doom',
      title: '2019 – The Season of Doom',
      date: '2020-04-13',
      excerpt: 'Seven uncatchable swarms, a serious allergic reaction, and eventually losing every single colony. Here\'s what happened — and why we\'re still at it.',
      content: `## The Swarms We Could Never Catch

See the top of that tree? That's how high they went. Every. Time.

For the first swarm, we called Chris Veazey — who climbs trees for a living. He graciously climbed a pine tree covered in poison ivy with no bee jacket. Alas, they re-swarmed across the street while he was attempting to remove them.

We had a total of 7 swarms (that we know of) and every single one went completely out of reach. We replaced 3 queens, but the hives weren't able to recover.

## A New Allergy

Dan has had some serious reactions to bee stings. On one occasion while mowing the lawn, he went into anaphylaxis and had his first ambulance ride to Strong Memorial. Instead of quitting, he started weekly bee venom injections — 97% effective — now reduced to once a month.

## 2019 By the Numbers

We extracted about 10 gallons of honey in July and none in the fall. This is the first year since our very first season that we lost 100% of our colonies. Three died from mites, one from humidity and mold.

Some positives: we completed our first eCornell Master Beekeeping course, sold out of honey, expanded into lip balm and bath bombs, and new bees are on the way.`,
    },
    {
      slug: 'bee-updates-2019',
      title: 'Bee Updates',
      date: '2019-06-28',
      excerpt: 'Yes, we\'re still at it. A quick rundown of a very busy beekeeping season — sales, swarms, splits, and a big new course.',
      content: `Yes, I'm a slacker with blogging. But that doesn't mean we quit the most expensive hobby. Here's where things stand:

1. A very successful year for honey and lip balm sales — we've gotten to know more of our neighborhood.
2. The lip balm container problem may finally be resolved.
3. Mighty Mite Thermal Treatment is our current mite control method.
4. We went into winter with 6 hives and entered spring with 3.
5. Attended the annual Geneva Bee Conference.
6. Purchased two more packages — briefly had 5 hives.
7. One hive absconded entirely.
8. Another hive swarmed — way too high to catch.
9. For the first time, we purchased a mated queen.
10. Attempted several hive splits from 10 queen cells.
11. We've enrolled in the eCornell Master Beekeeper program.

**Interesting fact:** Our hive that absconded was the last of the mean-queen descendants. We're not sorry.`,
    },
    {
      slug: 'lip-balm-container-annoyances',
      title: 'Lip Balm Container Annoyances',
      date: '2018-07-20',
      excerpt: 'Nine methods, countless spills, and one clear winner for labels. The full saga of figuring out how to package homemade lip balm.',
      content: `Putting together lip balm has been a frustrating process. Here's every method we've tried:

**Method 1: Mann Lake tubes with beaker pouring** — Messy spills, slow, sunken tops.

**Method 2: Mann Lake tubes with pipette** — Fewer spills but slow. Pipettes clogged with wax.

**Method 3: Bulk Apothecary filling tray** — Mann Lake tubes didn't fit; switched to Milliard brand.

**Method 4: Bulk Apothecary tray + Milliard tubes + Onlinelabels.com** — A breakthrough. Fill 50 tubes at once. Minor issue: loose caps.

**Method 5: Milliard brand labels** — Tab meant to secure caps failed to wrap around. Wasteful.

**Method 6: Milliard tubes, second batch** — Still too loose. Fall off when inverted.

**Method 7: California Home Goods Kit + tamper evident labels** — Excellent. One catch: no replacement containers sold separately.

**Method 8: Pure Acres Farm containers** — Fit neither tray. Trying pipette method again.

**Method 9: Premium Vials** — Awaiting arrival.

**Our firm recommendation:** [Onlinelabels.com](https://www.onlinelabels.com) for lip balm labels. No contest.`,
    },
    {
      slug: 'stay-cool-with-bearding',
      title: 'Stay Cool with Bearding',
      date: '2018-07-01',
      excerpt: 'It\'s 90°F for the third day in a row, and the bees have a fascinating solution — they hang out on the outside of the hive in a living, breathing beard.',
      content: `It's over 90°F outside for the third day in a row. You'd think that because honeybees keep their hive at 95°F year-round, the weather would be no big deal.

Imagine a small, nicely air-conditioned house on a day like today. You invite 100 people over. The house is overcrowded and the AC is struggling. What do you do?

For bees, the answer is **bearding**. At peak population — up to 80,000 bees — many leave the hive and cluster on the front face to reduce interior heat. It looks exactly like a beard hanging off the bottom of the hive.

The density of the beard tells you a lot: a strong hive beards fully, a weak one barely at all.

And a reminder: put water out for your bees. They need it too.

**Interesting fact:** Some bees are tasked with collecting water specifically for evaporative cooling — they spread it across the comb and fan their wings to move cool air through the hive.`,
    },
    {
      slug: 'treat-for-mites-or-nah',
      title: 'Treat for Mites, or Nah?',
      date: '2018-05-27',
      excerpt: 'The most divisive question in backyard beekeeping. Here\'s where we landed, and what it cost us to get there.',
      content: `Varroa mites are currently the number one killer of honeybee colonies. They're parasitic bugs that weaken bees, damage wings, and kill off colonies fast.

Effects of mite infestation:
1. Weakened bees and larvae
2. Shorter lifespans
3. Impaired navigation — less pollen and nectar collected
4. Bees born with deformed wings that can't fly

The debate: treat with chemicals, or leave nature alone?

Here's our treatment-free experiment:
- **Year 1:** No treatment. All hives died.
- **Year 2:** Treated 1 of 2. The untreated hive died in early fall.
- **Year 3:** Waited too long. One hive dead by September.
- **Year 4:** So many swarms we didn't know when to treat. Our strongest hive died in September.

This year we used **Mite-Away Quick-Strips** (formic acid) — can be applied before honey supers go on. The bees hated the smell and bearded heavily for the first 24 hours.

Hopefully bees will eventually develop natural tolerance. Until then, we treat.

**Interesting fact:** Varroa mites have a particular preference for nurse bees.`,
    },
    {
      slug: 'but-is-it-organic',
      title: 'But, is it Organic?',
      date: '2018-05-13',
      excerpt: 'The most common question we get — and the honest answer is no. Here\'s why urban honey can\'t be certified organic.',
      content: `*"Is the honey organic?"*

Nope. Let me explain.

Honeybees can travel up to 5 miles to gather pollen and nectar. Right now, the girls are all about the dandelions. Are the dandelions in your yard certified organic? Is your neighbor's yard? What about the yard three blocks over?

We have no idea where they've been.

For honey to be certified organic, hives must be placed at the center of a **5-mile radius of certified organic land**. Every farm, yard, and field within flying range must be chemical-free.

We live in the city in Rochester, NY. We cannot prove everyone's yard is free from chemicals. Certifiable organic honey here is impossible.

So when you see urban honey labeled "organic" — ask questions.

**Interesting fact:** If you buy raw, local honey that also claims to be certified organic, the business is either misinformed or not being straight with you.`,
    },
    {
      slug: 'spring-into-spring',
      title: 'Spring into Spring',
      date: '2018-05-06',
      excerpt: 'Winter survival updates, new Carniolan bees installed in near-freezing temps, and lessons learned about moisture and hive tilt.',
      content: `It's amazing how quickly winter turns to spring. We've been rushing around with bee-related things and are finally able to give an update.

## Winter Survival

By February, we had lost most of what we went into winter with. One hive was weak; two others tipped backward and died from moisture when snow melted. Moldy frames, very sad.

Fix: we're adding topsoil to give hives a slight forward incline so water drains away.

## New Bees

We ordered more Carniolan bees from Hungry Bear Farms. Notification came April 5th. It was in the low 30s and snowing on install day — we felt too bad about the shipping box, so we installed them into a nuc for insulation, added a foam entrance reducer, and gave everyone sugar patties.

We now have 3 living hives going into the season.

**Interesting fact:** In winter, bees cluster tightly around the queen and maintain the inside of the hive at 81–95°F no matter the outside temperature.`,
    },
    {
      slug: 'attempted-robbery',
      title: 'Attempted Robbery',
      date: '2017-10-28',
      excerpt: 'Late fall and the bees are in full defense mode — zero tolerance for thieves trying to raid their winter food supply.',
      content: `The ladies were in full force fighting off robbers last weekend. As the hives prepare for winter, they have absolutely no patience for intruders trying to steal their honey stores.

Late fall is prime time for robbing. Other insects — wasps and bees from weaker hives — will attempt to raid a colony when nectar sources dry up. A strong hive posts guards and ejects anyone who doesn't belong.

We caught some of the action on video:

- **Video 1:** The quickest way to deal with a robber. [Watch on YouTube](https://youtu.be/5vdw3e3MrWs)
- **Video 2:** Watch them push away a wasp. [Watch on YouTube](https://youtu.be/D3YjSsCtr4U)
- **Video 3:** If the intruder fights back, they lose. [Watch on YouTube](https://youtu.be/1bfmOlEROt4)

**Interesting fact:** Bees tend to target weaker hives when robbing — a strong colony is much harder to break into.`,
    },
  ]

  const insert = db.prepare(`
    INSERT INTO blog_posts (slug, title, date, excerpt, content)
    VALUES (@slug, @title, @date, @excerpt, @content)
  `)
  for (const post of posts) {
    insert.run(post)
  }
}

function seedInventory(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as n FROM product_inventory').get() as { n: number }).n
  if (count > 0) return

  // Seed with default prices from static product catalog
  const defaults: { id: string; price: number }[] = [
    { id: '1', price: 1400 },
    { id: '3', price: 500 },
    { id: '4', price: 700 },
    { id: '5', price: 1800 },
    { id: '6', price: 800 },
  ]
  const insert = db.prepare('INSERT INTO product_inventory (product_id, stock, price) VALUES (?, 0, ?)')
  for (const { id, price } of defaults) {
    insert.run(id, price)
  }
}
