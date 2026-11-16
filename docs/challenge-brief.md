# Challenge brief - Build a Junior Astronaut Mission Trainer

Source: <https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/> (NASA Space Apps Challenge 2026; categories Intermediate and Beginner/Youth; skills: Games, Planets & Moons, Software, Space Exploration, Sun). The page is rendered client-side, so AI tools often cannot fetch it. This copy was taken on 2026-11-13.

## Summary (quoted)

> Space-themed STEM content often oversimplifies the engineering trade-offs that define a real mission or presents them at a level too complex to hold a young learner's attention. Few tools make those trade-offs both tangible and fun. Your challenge is to design and build an interactive game or app that lets students run a lunar or Martian outpost, balancing competing demands like life support, radiation shielding, power, and food production, so they experience firsthand the decisions that determine whether a mission fails or succeeds.

## Background (key points)

- Astronauts on a lunar or Martian outpost must balance competing demands. Limited power is split between life support, communications and science. Radiation exposure is weighed against mission objectives. Every decision carries a resource cost that compounds over time.
- NASA mission planners use real data for these decisions: DONKI (solar activity and radiation risk), OSDR (astronaut radiation dosimetry and biology), and Artemis and Mars surface mission data.
- The gap is translation. Kids' content is either too abstract (posters, facts) or too technical. Purely educational content loses attention; purely entertaining content loses accuracy.
- Quote: _"a choice that saves power today might cost oxygen tomorrow. Grounding gameplay in real NASA open data, rather than invented statistics, is encouraged."_

## Objectives (key points)

- Build an interactive game or app for kids aged **7-12** that runs an outpost and makes the trade-offs felt. Quote: _"what does it feel like to trade oxygen reserves for an extra research opportunity, or to reinforce shielding against a radiation event at the cost of tonight's power supply?"_
- Represent competing resources so that **no choice is free** and every decision teaches something true.
- Use real NASA open data wherever possible (DONKI, OSDR, Artemis/Mars surface data); live or archived.
- Format is open: survival or resource management, a narrative decision simulator, a mission-control dashboard; browser, mobile or desktop.
- Goal: _"a working prototype that demonstrates the trade-off mechanic clearly enough that a young player walks away understanding a real constraint of deep space survival, not just having played a fun game."_
- Creative interpretations of "outpost", "site" or "mission" are welcome if the educational goal stays central.

## Potential considerations (key points)

- **Audience and accessibility:** ages 7-12; consider wider audiences and accessibility.
- **Grounding in real data:** even a small amount of real data (one radiation reading, one Mars photo, one health finding) makes the game more credible. **Attribute sources inside the tool.** If live API calls are not feasible, _"a curated real dataset embedded directly into your tool is a reasonable and honest alternative - just don't present static data as live."_
- **Pitfalls to avoid:**
  - A "safe" choice with no cost.
  - Visual polish instead of mechanical accuracy (_"a simple game that teaches a real constraint beats a beautiful one that doesn't"_).
  - Too many systems at once: _"two or three core resources - life support, power, shielding - are usually more effective than five or six."_

## Listed resources

- **DONKI** - solar flares, coronal mass ejections and other space weather that drive radiation risk.
- **NASA OSDR** (with search API) - space biology and astronaut health research (bone density, muscle, immune response, sleep).
- **RadLab** (OSDR radiation dosimetry database) - real ISS dosimeter measurements, such as absorbed dose rate.
- **Mars Trek** - Mars surface imagery, elevation and terrain data.
- Partner resources: CSA (Canadian Space Agency) STEM and youth resources; a toolkit on food production on the Moon and in remote areas.

## How this repo maps to the judging signals

| Signal                   | Where we address it                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| No free choice           | `design-rules.test.ts` (gain + cost, no dominated choices)                                  |
| 2-3 resources            | **Deliberately exceeded:** 5 (power, air, water, food, shielding) - see `docs/decisions.md` |
| Real data, attributed    | `src/data/*`, Data Sources screen, `RealDataBadge`                                          |
| Static not shown as live | `meta.isLive: false`; separate labelled LIVE panel                                          |
| Kid wording              | `docs/content-guidelines.md`, text-length tests                                             |
| Learning outcome         | Debrief screen: one lesson per choice used plus a real NASA fact                            |
