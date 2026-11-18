---
name: maestro-flow
description: Explore a user journey on the simulator with Maestro and save it as a repeatable .maestro flow test.
disable-model-invocation: true
argument-hint: <journey, e.g. "sign up and create first note">
---
Journey: $ARGUMENTS
1. Make sure a simulator/emulator is booted and the dev build is running (`npx expo run:ios` or `run:android`).
2. Use the Maestro MCP tools to walk the journey step by step, preferring accessibility IDs over coordinates; add `testID`s in code where elements lack them.
3. Save the result as `.maestro/<journey-slug>.yaml` and run `maestro test .maestro/<journey-slug>.yaml` until it passes twice in a row.
4. Report the flow file path and anything flaky.
