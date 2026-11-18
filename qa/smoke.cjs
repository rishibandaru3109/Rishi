const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PORTFOLIO_PLAYWRIGHT || "playwright");

const origin = process.env.PORTFOLIO_URL || "http://localhost:4173";
const scenes = [
  ["hero", "#home", ".knot"],
  ["stereo", "#stereo .project-reel", ".project-portal"],
  ["viral-machine", "#viral-machine .project-reel", ".project-portal"],
  ["airupi", "#airupi .project-reel", ".project-portal"],
  ["about", "#about", ".split-heading > span:last-child"],
  ["playground", "#playground", ".lab"],
  ["contact", "#contact", ".finale-orbit"],
];
const output = process.env.PORTFOLIO_CAPTURES;

async function prepare(context, errors) {
  if (process.env.PORTFOLIO_EXPORT) {
    await context.route(origin + "/**", route => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      const relative = pathname.endsWith("/") ? pathname + "index.html" : pathname;
      const file = path.join(process.cwd(), ".next-build", relative);
      return fs.existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404 });
    });
  }
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  return page;
}

async function scrub(page, selector, target, progress) {
  const y = await page.locator(selector).evaluate((scene, amount) => {
    const pinned = scene.hasAttribute("data-pinned");
    const bounds = scene.getBoundingClientRect();
    const start = scrollY + bounds.top - (pinned ? 0 : innerHeight * .75);
    const available = document.documentElement.scrollHeight - innerHeight - start;
    const distance = Math.min(pinned ? bounds.height - innerHeight : bounds.height, available);
    return start + distance * amount;
  }, progress);
  await page.evaluate(position => window.scrollTo({ top: position, behavior: "instant" }), y);
  await page.waitForFunction(([query, position, progress]) => {
    const value = document.querySelector(query).style.getPropertyValue("--scene");
    return Math.abs(scrollY - position) < 2 && value !== "" && Math.abs(Number(value) - progress) < .004;
  }, [selector, y, progress]);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.locator(selector).locator(target).evaluate(el => getComputedStyle(el).transform);
}

async function verifyScene(page, [name, selector, target], device) {
  const checkpoints = [0, .25, .50, .75, 1];
  const matrices = [];
  for (const amount of checkpoints) {
    const matrix = await scrub(page, selector, target, amount);
    if (matrices.length) assert.notEqual(matrix, matrices.at(-1), `${name} ${device}: unchanged at ${amount}`);
    matrices.push(matrix);
    if (output) await page.screenshot({ path: path.join(output, `${device}-${name}-${amount * 100}.png`) });
  }
  for (let index = checkpoints.length - 2; index >= 0; index--) {
    assert.equal(await scrub(page, selector, target, checkpoints[index]), matrices[index], `${name}: reverse scroll at ${checkpoints[index]}`);
  }
  console.log(`${device}: ${name} scrubbed at 0%, 25%, 50%, 75%, 100% and reversed`);
}

(async () => {
  if (output) fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PORTFOLIO_CHROME });
  const errors = [];
  try {
    const desktop = await prepare(await browser.newContext({
      viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"],
    }), errors);
    assert.equal((await desktop.goto(origin)).status(), 200);
    await desktop.getByRole("heading", { level: 1, name: /rishi bandaru/i }).waitFor();
    await desktop.waitForFunction(() => document.querySelector(".knot canvas[data-drawn]"));
    await desktop.waitForFunction(() => {
      const canvas = document.querySelector('h1[data-reveal="running"] .particleName');
      return canvas && canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
        .data.some((value, index) => index % 4 === 3 && value > 0);
    });
    await desktop.getByRole("button", { name: "Skip intro" }).click();
    for (const scene of scenes) await verifyScene(desktop, scene, "desktop");
    await desktop.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const knot = desktop.locator(".knot canvas");
    const imageBefore = await knot.evaluate(canvas => canvas.toDataURL());
    await desktop.mouse.move(1120, 320);
    await desktop.waitForFunction(previous => document.querySelector(".knot canvas").toDataURL() !== previous, imageBefore);

    await scrub(desktop, "#stereo .project-reel", ".project-portal", .48);
    const cover = desktop.locator("#stereo .project-portal");
    await cover.locator('.ditherLayer[data-ready="true"]').waitFor({ state: "attached" });
    await cover.hover();
    await desktop.waitForFunction(() => Number(getComputedStyle(document.querySelector("#stereo .ditherLayer")).opacity) > .5);
    assert.equal(await desktop.locator(".project-world").count(), 3);
    for (const id of ["stereo", "viral-machine", "airupi"]) {
      const project = desktop.locator("#" + id);
      await project.getByRole("link", { name: "Explore project", exact: true }).click();
      assert.equal(new URL(desktop.url()).pathname, "/");
      await project.getByText("Project details", { exact: true }).click();
      await project.getByRole("heading", { name: "My role" }).waitFor();
    }
    await desktop.getByRole("button", { name: "Play simulation" }).click();
    await desktop.getByRole("button", { name: "Pause simulation" }).waitFor();
    await desktop.getByRole("button", { name: "Render", exact: true }).click();
    await desktop.getByText("Assemble the video, captions, and audio.").waitFor();
    for (const name of [/Generate sample/, /Receive sample/, /Simulate check/, /Queue sample/]) {
      await desktop.getByRole("button", { name }).click();
    }
    await desktop.getByRole("heading", { name: "Voucher queued" }).waitFor();

    const command = desktop.getByRole("textbox", { name: "Terminal command" });
    const commands = { help: "whoami", whoami: "First-year B.Tech student", projects: "Viral Machine",
      skills: "C, Python.", github: "https://github.com/rishibandaru3109", contact: "rishibandaru.3109@gmail.com" };
    for (const [input, result] of Object.entries(commands)) {
      await command.fill(input);
      await command.press("Enter");
      assert.ok((await desktop.getByRole("log").textContent()).includes(result));
    }
    await command.fill("clear");
    await command.press("Enter");
    assert.equal(await desktop.getByRole("log").textContent(), "Type help to see commands.");
    await desktop.getByRole("button", { name: "Gravity" }).click();
    const gravity = desktop.locator(".lab canvas");
    const arena = await gravity.boundingBox();
    assert.ok(arena.width > 1000 && arena.height > 400);
    await desktop.waitForFunction(() => document.querySelector(".lab canvas").width > 1000);
    await gravity.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await desktop.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const settled = await gravity.boundingBox();
    const pickX = settled.x + settled.width * .14;
    const pickY = settled.y + settled.height - 62;
    await desktop.waitForFunction(() => {
      const canvas = document.querySelector(".lab canvas");
      const pixel = canvas.getContext("2d").getImageData(canvas.width * .14,
        (canvas.clientHeight - 60) * canvas.height / canvas.clientHeight, 1, 1).data;
      return pixel[1] > 180;
    });
    await desktop.mouse.move(pickX, pickY);
    assert.ok(await desktop.evaluate(([x, y]) => document.elementFromPoint(x, y)?.matches(".gravity canvas"), [pickX, pickY]));
    await desktop.mouse.down();
    assert.ok(await gravity.evaluate(el => el.hasPointerCapture(1)), "The shape can be grabbed");
    await desktop.mouse.move(pickX, settled.y + settled.height * .25, { steps: 6 });
    await desktop.waitForFunction(() => {
      const canvas = document.querySelector(".lab canvas");
      const pixel = canvas.getContext("2d").getImageData(canvas.width * .14, canvas.height * .25, 1, 1).data;
      return pixel[1] > 180;
    });
    if (output) await gravity.screenshot({ path: path.join(output, "desktop-gravity.png") });
    await desktop.mouse.up();
    await desktop.getByRole("button", { name: /reset and drop/i }).click();
    await desktop.getByRole("button", { name: "Binary search" }).click();
    for (let i = 0; i < 3; i++) await desktop.getByRole("button", { name: /compare midpoint/i }).click();
    assert.ok((await desktop.locator(".labbody").textContent()).includes("Found 21"));
    await desktop.getByRole("button", { name: "Copy email address" }).click();
    assert.equal(await desktop.evaluate(() => navigator.clipboard.readText()), "rishibandaru.3109@gmail.com");
    await desktop.getByRole("link", { name: /back to top/i }).click();
    await desktop.waitForFunction(() => scrollY < 100);

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await prepare(mobileContext, errors);
    await mobile.goto(origin);
    await mobile.getByRole("button", { name: /Menu/ }).tap();
    await mobile.getByRole("navigation").getByText("Projects").tap();
    assert.ok(mobile.url().endsWith("#projects"));
    await mobile.waitForFunction(() => {
      const projects = document.querySelector("#projects");
      return Math.abs(projects.getBoundingClientRect().top - parseFloat(getComputedStyle(projects).scrollMarginTop)) < 2;
    });
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await mobile.goto(origin);
    await mobile.locator(".knot canvas[data-drawn]").waitFor();
    for (const scene of scenes) await verifyScene(mobile, scene, "mobile");
    await mobile.locator("#stereo").getByRole("button", { name: "Play simulation" }).tap();
    await mobile.locator("#stereo").getByRole("button", { name: "Pause simulation" }).waitFor();
    await scrub(mobile, "#playground", ".lab", .85);
    const gravityTab = mobile.getByRole("button", { name: "Gravity", exact: true });
    await gravityTab.tap();
    assert.equal(await gravityTab.getAttribute("aria-pressed"), "true");
    const mobileArena = mobile.locator(".gravity canvas");
    const mobileBox = await mobileArena.boundingBox();
    assert.ok(mobileBox.width >= 300 && mobileBox.height > 320, JSON.stringify(mobileBox));
    console.log("Gravity arena (desktop/mobile): " +
      [arena, mobileBox].map(box => Math.round(box.width) + "×" + Math.round(box.height)).join(" / "));
    if (output) await mobileArena.screenshot({ path: path.join(output, "mobile-gravity.png") });
    await mobile.getByRole("button", { name: "Binary search" }).tap();
    await mobile.getByRole("button", { name: /compare midpoint/i }).tap();

    await mobile.emulateMedia({ reducedMotion: "reduce" });
    await mobile.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await mobile.locator(".hero-stage").evaluate(el => getComputedStyle(el).position), "relative");
    assert.equal(await mobile.locator(".knot canvas").evaluate(el => getComputedStyle(el).display), "none");
    assert.equal(await mobile.locator(".heroName").evaluate(el => getComputedStyle(el).opacity), "1");
    assert.equal(await mobile.locator(".project-portal").first().evaluate(el => getComputedStyle(el).transform), "none");
    const keyboard = await prepare(await browser.newContext({ reducedMotion: "reduce" }), errors);
    await keyboard.goto(origin);
    await keyboard.keyboard.press("Tab");
    assert.equal(await keyboard.evaluate(() => document.activeElement.textContent), "Skip to content");
    await keyboard.keyboard.press("Enter");
    assert.equal(new URL(keyboard.url()).hash, "#main");
    assert.deepEqual(errors, []);
    console.log("Desktop, mobile, keyboard, reduced-motion, and demo regression checks passed.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
