// ============================================================================
// SHERU BHAI – ROYAL ENDLESS RUN (INDIA EDITION) | REALISTIC CANVAS RENDERER
// ============================================================================

window.GAME_RENDERER = (() => {
  // Draw Sheru Bhai with realistic heroic proportions, tailored 3-piece suit,
  // flowing white lion mane, interlocking gold chain & polished brown loafers.
  function drawSheru(ctx, x, y, w, h, opts = {}) {
    const {
      anim = 'run',
      time = 0,
      skin = window.GAME_DATA.SKINS[0],
      activePowers = {},
      squashX = 1,
      squashY = 1,
      rotation = 0,
      flash = false,
      groundY = null
    } = opts;

    // Ground shadow (shrinks dynamically as Sheru jumps higher)
    if (groundY !== null) {
      const distFromGround = Math.max(0, groundY - (y + h));
      const shadowScale = Math.max(0.32, 1 - distFromGround / 230);
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${0.34 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, groundY + 3, w * 0.52 * shadowScale, 7.5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    const cx = x + w * 0.5;
    const cy = y + h;

    ctx.translate(cx, cy);
    if (rotation !== 0) {
      ctx.translate(0, -h * 0.5);
      ctx.rotate(rotation);
      ctx.translate(0, h * 0.5);
    }
    ctx.scale(squashX, squashY);

    // Aura for skins or active powerups
    if (skin.glow || activePowers.invincibility || activePowers.speed) {
      ctx.save();
      const auraColor = activePowers.invincibility
        ? 'rgba(255, 223, 77, 0.55)'
        : activePowers.speed
        ? 'rgba(250, 204, 21, 0.45)'
        : skin.glow || 'rgba(255, 215, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.52, w * 0.72, h * 0.58, 0, 0, Math.PI * 2);
      ctx.fillStyle = auraColor;
      ctx.fill();
      ctx.restore();
    }

    // Royal Kavach (Shield) Bubble
    if (activePowers.shield) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.5, w * 0.78, h * 0.62, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.92)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Royal Flight Wings
    if (activePowers.flight) {
      ctx.save();
      const wingFlap = Math.sin(time * 16) * 14;
      ctx.fillStyle = 'rgba(255, 217, 102, 0.88)';
      ctx.beginPath();
      ctx.moveTo(-10, -h * 0.62);
      ctx.quadraticCurveTo(-54, -h * 0.9 + wingFlap, -64, -h * 0.48 + wingFlap);
      ctx.quadraticCurveTo(-30, -h * 0.45, -10, -h * 0.52);
      ctx.fill();
      ctx.restore();
    }

    if (flash) ctx.globalAlpha = 0.55;

    const isSlide = anim === 'slide';
    const isIdle = anim === 'idle';
    const isJump = anim === 'jump' || anim === 'doubleJump';
    const isVictory = anim === 'victory';
    const isGameOver = anim === 'gameOver';

    // Normalize onto a 120x210 anatomical rig so every detail scales cleanly!
    const sx = w / 120;
    const sy = h / 210;
    ctx.scale(sx, sy);

    let headCounterRotate = 0;
    if (isSlide) {
      ctx.translate(-8, -28);
      ctx.rotate(-0.5);
      headCounterRotate = 0.44;
    } else if (isJump && anim === 'jump') {
      ctx.translate(0, -105);
      ctx.rotate(0.08);
      ctx.translate(0, 105);
    } else if (isGameOver) {
      ctx.translate(0, -18);
      ctx.rotate(-0.45);
    }

    const stride = isIdle || isVictory || isGameOver ? 0 : isJump ? 0.72 : Math.sin(time * 17);
    const bob = isIdle ? Math.sin(time * 2.8) * 2.2 : (isJump || isSlide) ? 0 : Math.abs(Math.sin(time * 17)) * -6;
    ctx.translate(0, bob);

    // 1. Lion Tail (graceful curve behind suit like reference photo)
    ctx.save();
    const tailWave = Math.sin(time * 8) * 9;
    ctx.strokeStyle = shadeColor(skin.fur, -8);
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, isSlide ? -22 : -92);
    ctx.quadraticCurveTo(-48, (isSlide ? -26 : -78) + tailWave * 0.5, -52, (isSlide ? -8 : -44) + tailWave);
    ctx.stroke();
    ctx.fillStyle = skin.mane;
    ctx.strokeStyle = 'rgba(130, 105, 75, 0.32)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(-53, (isSlide ? -7 : -41) + tailWave, 9, 6, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Tapered Tailored Trousers & Polished Brown Leather Loafers (~46% height = 96 units)
    const legLen = 96;
    const hipY = isSlide ? -12 : -legLen;
    const stanceSpread = isIdle || isVictory ? 14 : 6;
    const leftAngle = isIdle || isVictory ? 0.06 : isSlide ? 1.15 : isJump ? 0.58 : -stride * 0.56;
    const rightAngle = isIdle || isVictory ? -0.06 : isSlide ? -1.12 : isJump ? -0.72 : stride * 0.56;

    const drawLeg = (angle, offsetX, isBack, flipFoot) => {
      ctx.save();
      ctx.translate(offsetX, hipY);
      ctx.rotate(angle);
      // Tapered trouser silhouette (wider thigh -> slim ankle)
      ctx.fillStyle = isBack ? shadeColor(skin.suit, -9) : skin.suit;
      ctx.strokeStyle = 'rgba(95, 75, 50, 0.34)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(11, 0);
      ctx.lineTo(8, legLen - 12);
      ctx.lineTo(-8, legLen - 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crisp trouser center crease
      ctx.strokeStyle = 'rgba(125, 100, 70, 0.24)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, legLen - 14);
      ctx.stroke();

      // Polished Brown Formal Leather Loafer with Heel & Gold Horsebit
      const dir = flipFoot ? -1 : 1;
      ctx.save();
      ctx.scale(dir, 1);
      // Shoe body
      ctx.fillStyle = skin.shoes;
      ctx.beginPath();
      ctx.moveTo(-9, legLen - 13);
      ctx.lineTo(6, legLen - 13);
      ctx.quadraticCurveTo(18, legLen - 11, 21, legLen - 4);
      ctx.lineTo(20, legLen);
      ctx.lineTo(-9, legLen);
      ctx.closePath();
      ctx.fill();
      // Shoe dark sole & heel
      ctx.fillStyle = '#241208';
      ctx.fillRect(-9, legLen - 2.5, 29, 2.5);
      // Leather gloss highlight
      ctx.fillStyle = 'rgba(255, 225, 190, 0.25)';
      ctx.beginPath();
      ctx.ellipse(9, legLen - 8.5, 6, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Gold horsebit buckle
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(1, legLen - 10.5);
      ctx.lineTo(9, legLen - 10.5);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    };
    drawLeg(leftAngle, -stanceSpread, true, isIdle || isVictory);
    drawLeg(rightAngle, stanceSpread, false, false);

    // 3. Torso: V-Tapered Luxury 3-Piece Suit (Broad Shoulders -> Slim Waist)
    const torsoH = 66;
    const shoulderHalf = 34;
    const waistHalf = 26;
    const torsoTop = hipY - torsoH + 6;

    // Back Jacket Skirt & Tapered Body
    ctx.fillStyle = skin.suit;
    ctx.strokeStyle = 'rgba(95, 75, 50, 0.38)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-shoulderHalf, torsoTop + 6);
    ctx.quadraticCurveTo(-shoulderHalf + 2, torsoTop, -14, torsoTop - 2);
    ctx.lineTo(14, torsoTop - 2);
    ctx.quadraticCurveTo(shoulderHalf - 2, torsoTop, shoulderHalf, torsoTop + 6);
    ctx.lineTo(waistHalf + 2, torsoTop + torsoH + 6);
    ctx.quadraticCurveTo(0, torsoTop + torsoH + 10, -waistHalf - 2, torsoTop + torsoH + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crisp White Open-Collar Dress Shirt
    ctx.fillStyle = skin.shirt;
    ctx.beginPath();
    ctx.moveTo(-13, torsoTop - 2);
    ctx.lineTo(13, torsoTop - 2);
    ctx.lineTo(4, torsoTop + 26);
    ctx.lineTo(-4, torsoTop + 26);
    ctx.closePath();
    ctx.fill();

    // Sharp Open Shirt Collar Wings
    ctx.fillStyle = shadeColor(skin.shirt, -4);
    ctx.strokeStyle = 'rgba(120, 100, 75, 0.35)';
    ctx.lineWidth = 1.2;
    [[-1, -14, -18, -7, -10], [1, 14, 18, 7, 10]].forEach(([, a, b, c, d]) => {
      ctx.beginPath();
      ctx.moveTo(a, torsoTop - 2);
      ctx.lineTo(b, torsoTop + 10);
      ctx.lineTo(c, torsoTop + 14);
      ctx.lineTo(d, torsoTop + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Tailored Waistcoat / Vest with 4 Gold Buttons & Angled Hem Points
    ctx.fillStyle = skin.vest;
    ctx.strokeStyle = 'rgba(110, 88, 55, 0.38)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-14, torsoTop + 12);
    ctx.lineTo(0, torsoTop + 25);
    ctx.lineTo(14, torsoTop + 12);
    ctx.lineTo(15, torsoTop + torsoH - 2);
    ctx.lineTo(8, torsoTop + torsoH + 5);
    ctx.lineTo(0, torsoTop + torsoH - 1);
    ctx.lineTo(-8, torsoTop + torsoH + 5);
    ctx.lineTo(-15, torsoTop + torsoH - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vest center seam & 4 gold buttons
    ctx.strokeStyle = 'rgba(110, 88, 55, 0.28)';
    ctx.beginPath();
    ctx.moveTo(0, torsoTop + 25);
    ctx.lineTo(0, torsoTop + torsoH - 1);
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    for (let b = 0; b < 4; b++) {
      ctx.beginPath();
      ctx.arc(0, torsoTop + 29 + b * 8, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tailored Jacket Notched Lapels (Left & Right)
    ctx.fillStyle = shadeColor(skin.suit, 4);
    ctx.strokeStyle = 'rgba(95, 75, 50, 0.42)';
    ctx.lineWidth = 1.4;
    [[-1, -13, -24, -18, -11], [1, 13, 24, 18, 11]].forEach(([, x1, x2, x3, x4]) => {
      ctx.beginPath();
      ctx.moveTo(x1, torsoTop - 1);
      ctx.lineTo(x2, torsoTop + 13);
      ctx.lineTo(x3, torsoTop + 24);
      ctx.lineTo(x4, torsoTop + 42);
      ctx.lineTo(x1 * 0.9, torsoTop + 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Folded Gold Pocket Square in Breast Pocket
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(15, torsoTop + 18);
    ctx.lineTo(25, torsoTop + 13);
    ctx.lineTo(26, torsoTop + 20);
    ctx.closePath();
    ctx.fill();

    // Suit Flap Pockets on Waist
    ctx.strokeStyle = 'rgba(95, 75, 50, 0.36)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-24, torsoTop + 45, 11, 3.5);
    ctx.strokeRect(13, torsoTop + 45, 11, 3.5);

    // 4. Tailored Arms & White Lion Paws
    // In jump: back arm sweeps backward (+0.75 rad), front arm reaches forward-up (-1.85 rad) so hands NEVER join/cross!
    const leftArmAngle = isVictory ? -2.35 : isIdle ? 0.14 : isSlide ? 0.92 : isJump ? 0.75 : -stride * 0.56;
    const rightArmAngle = isVictory ? -0.38 : isIdle ? -0.14 : isSlide ? -0.82 : isJump ? -1.85 : stride * 0.56;
    const drawArm = (angle, ox, isBack) => {
      ctx.save();
      ctx.translate(ox, torsoTop + 7);
      ctx.rotate(angle);
      ctx.fillStyle = isBack ? shadeColor(skin.suit, -8) : skin.suit;
      ctx.strokeStyle = 'rgba(95, 75, 50, 0.36)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.lineTo(5.5, 54);
      ctx.lineTo(-5.5, 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White shirt cuff
      ctx.fillStyle = skin.shirt;
      ctx.fillRect(-5, 52, 10, 4.5);
      // White Lion Paw
      ctx.fillStyle = skin.fur;
      ctx.beginPath();
      ctx.ellipse(0, 61, 6, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawArm(leftArmAngle, -shoulderHalf + 4, true);
    drawArm(rightArmAngle, shoulderHalf - 4, false);

    // 5. Head: Realistic Sculpted White Lion with Flowing Swept-Back Mane
    const headY = torsoTop - 22;
    const headR = 24;

    ctx.save();
    if (headCounterRotate !== 0) {
      ctx.translate(0, headY);
      ctx.rotate(headCounterRotate);
      ctx.translate(0, -headY);
    }

    // Back-shoulder mane drape anchored to headY so it never detaches during slide!
    ctx.fillStyle = shadeColor(skin.mane, -12);
    ctx.beginPath();
    ctx.ellipse(0, headY + 22, 33, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dense Multi-Layered Lion Mane (optimized batch paths for 60 FPS on mobile & tablets)
    // Layer A: Deep Undercoat Volume
    ctx.fillStyle = shadeColor(skin.mane, -14);
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const isBottom = Math.sin(a) > 0.42;
      const radDist = isBottom ? headR * 0.88 : headR * 1.32;
      const tuftR = isBottom ? 11 : 15;
      const rx = Math.cos(a) * radDist * 1.04;
      const ry = headY + Math.sin(a) * radDist * (isBottom ? 0.9 : 1.08);
      ctx.moveTo(rx + tuftR, ry);
      ctx.arc(rx, ry, tuftR, 0, Math.PI * 2);
    }
    ctx.fill();

    // Layer B: Dense Feathered Radial Fur Strands
    ctx.fillStyle = shadeColor(skin.mane, -5);
    const densePts = 28;
    ctx.beginPath();
    for (let i = 0; i <= densePts * 2; i++) {
      const a = (i / (densePts * 2)) * Math.PI * 2;
      const isBottom = Math.sin(a) > 0.42;
      const jitter = Math.sin(i * 3.7) * 2.5;
      const baseR = (isBottom ? headR * 1.08 : headR * 1.56) + jitter;
      const spike = i % 2 === 0 ? baseR * 1.1 : baseR * 0.9;
      const rx = Math.cos(a) * spike * 0.98;
      const ry = headY + Math.sin(a) * spike * (isBottom ? 0.85 : 1.06);
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();

    // Layer C: Bright Fluffy Mid-Mane & Crown Tufts (single batched fill)
    ctx.fillStyle = skin.mane;
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.1;
      const isBottom = Math.sin(a) > 0.45;
      const radDist = isBottom ? headR * 0.82 : headR * 1.12;
      const rx = Math.cos(a) * radDist * 0.96;
      const ry = headY + Math.sin(a) * radDist * (isBottom ? 0.84 : 1.02);
      const tr = isBottom ? 9 : 12.5;
      ctx.moveTo(rx + tr, ry);
      ctx.arc(rx, ry, tr, 0, Math.PI * 2);
    }
    ctx.fill();

    // Layer D: Subtle Fur Texture Lines inside Mane
    ctx.strokeStyle = 'rgba(170, 145, 108, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      if (Math.sin(a) > 0.5) continue;
      ctx.moveTo(Math.cos(a) * 21, headY + Math.sin(a) * 21);
      ctx.lineTo(Math.cos(a) * 35, headY + Math.sin(a) * 36);
    }
    ctx.stroke();

    // Rounded Lion Ears (tucked in upper mane with inner ear shadow)
    [-1, 1].forEach(side => {
      ctx.fillStyle = skin.fur;
      ctx.beginPath();
      ctx.ellipse(side * 20, headY - 19, 6.5, 7, side * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8b498';
      ctx.beginPath();
      ctx.ellipse(side * 20, headY - 19, 3.2, 3.8, side * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sculpted Lion Face & Cheekbones (fast fill without per-frame gradient allocation)
    const fx = isIdle || isVictory ? 0 : 2.5;
    ctx.fillStyle = skin.fur;
    ctx.beginPath();
    ctx.moveTo(fx - 17, headY - 12);
    ctx.quadraticCurveTo(fx, headY - 22, fx + 17, headY - 12);
    ctx.quadraticCurveTo(fx + 21, headY + 4, fx + 12, headY + 17);
    ctx.quadraticCurveTo(fx, headY + 22, fx - 12, headY + 17);
    ctx.quadraticCurveTo(fx - 21, headY + 4, fx - 17, headY - 12);
    ctx.closePath();
    ctx.fill();

    // Realistic Broad Lion Nose Bridge
    ctx.fillStyle = 'rgba(175, 148, 112, 0.25)';
    ctx.beginPath();
    ctx.moveTo(fx - 4.5, headY - 9);
    ctx.lineTo(fx + 4.5, headY - 9);
    ctx.lineTo(fx + 6, headY + 4);
    ctx.lineTo(fx - 6, headY + 4);
    ctx.closePath();
    ctx.fill();

    // Sculpted Whisker Pads & Chin
    const nx = fx + (isIdle || isVictory ? 0 : 2.5);
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.ellipse(nx - 4.5, headY + 9, 6.5, 4.8, 0, 0, Math.PI * 2);
    ctx.ellipse(nx + 4.5, headY + 9, 6.5, 4.8, 0, 0, Math.PI * 2);
    ctx.ellipse(nx, headY + 13.5, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whisker spots
    ctx.fillStyle = 'rgba(120, 95, 70, 0.45)';
    [-6, -4, 4, 6].forEach(wx => {
      ctx.beginPath();
      ctx.arc(nx + wx, headY + 9.5, 0.85, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sculpted Lion Nose (Pinkish-brown bridge + Black tip)
    ctx.fillStyle = '#231815';
    ctx.beginPath();
    ctx.moveTo(nx - 5.5, headY + 4);
    ctx.quadraticCurveTo(nx, headY + 2.5, nx + 5.5, headY + 4);
    ctx.lineTo(nx, headY + 9.5);
    ctx.closePath();
    ctx.fill();

    // Confident Mouth / Roar
    ctx.strokeStyle = '#2b1f1a';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    if (anim === 'bossAttack') {
      ctx.fillStyle = '#7f1d1d';
      ctx.ellipse(nx, headY + 13.5, 5.5, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(nx, headY + 9.5);
      ctx.lineTo(nx, headY + 12.2);
      ctx.moveTo(nx - 5, headY + 12.2);
      ctx.quadraticCurveTo(nx, headY + 14.5, nx + 5, headY + 12.2);
      ctx.stroke();
    }

    // Fierce Golden Lion Eyes (or Royal Sunglasses)
    const exLeft = fx + (isIdle || isVictory ? -8.5 : -5);
    const exRight = fx + (isIdle || isVictory ? 8.5 : 11);
    if (skin.sunglasses) {
      // --- Black Aviator Sunglasses with Gold Frame ---
      const traceLens = (cx, cy) => {
        ctx.moveTo(cx - 7.5, cy - 5);
        ctx.quadraticCurveTo(cx, cy - 7.5, cx + 7.5, cy - 5);
        ctx.quadraticCurveTo(cx + 9, cy + 1, cx + 6, cy + 5);
        ctx.quadraticCurveTo(cx, cy + 6.5, cx - 6, cy + 5);
        ctx.quadraticCurveTo(cx - 9, cy + 1, cx - 7.5, cy - 5);
        ctx.closePath();
      };
      // Dark tinted lenses (both in one path or filled individually)
      ctx.fillStyle = '#0d0d14';
      ctx.beginPath();
      traceLens(exLeft, headY - 3);
      ctx.fill();
      ctx.beginPath();
      traceLens(exRight, headY - 3);
      ctx.fill();
      // Gold metal frame
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      traceLens(exLeft, headY - 3);
      ctx.stroke();
      ctx.beginPath();
      traceLens(exRight, headY - 3);
      ctx.stroke();
      // Bridge between lenses
      ctx.beginPath();
      ctx.moveTo(exLeft + 7, headY - 5);
      ctx.quadraticCurveTo((exLeft + exRight) / 2, headY - 7.5, exRight - 7, headY - 5);
      ctx.stroke();
      // Temple arms extending to ears
      ctx.beginPath();
      ctx.moveTo(exLeft - 7.5, headY - 4);
      ctx.lineTo(exLeft - 14, headY - 5);
      ctx.moveTo(exRight + 7.5, headY - 4);
      ctx.lineTo(exRight + 14, headY - 5);
      ctx.stroke();
      // Subtle lens reflection glare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.ellipse(exLeft - 2, headY - 5, 3, 1.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(exRight - 2, headY - 5, 3, 1.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sculpted Brow Ridge
      ctx.strokeStyle = 'rgba(130, 102, 70, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(exLeft - 5, headY - 8);
      ctx.lineTo(exLeft + 4, headY - 6);
      ctx.moveTo(exRight + 5, headY - 8);
      ctx.lineTo(exRight - 4, headY - 6);
      ctx.stroke();

      [exLeft, exRight].forEach(ex => {
        ctx.fillStyle = '#291d14';
        ctx.beginPath();
        ctx.ellipse(ex, headY - 4, 4.3, 3.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(ex, headY - 4, 3.3, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#110a04';
        ctx.beginPath();
        ctx.arc(ex, headY - 4, 1.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex - 1, headY - 4.8, 0.85, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Crown
    if (skin.crown || activePowers.invincibility) {
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-12, headY - 27);
      ctx.lineTo(-14, headY - 40);
      ctx.lineTo(-5, headY - 32);
      ctx.lineTo(0, headY - 43);
      ctx.lineTo(5, headY - 32);
      ctx.lineTo(14, headY - 40);
      ctx.lineTo(12, headY - 27);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore(); // End head counter-rotate

    // 6. Gleaming Interlocking Gold Cuban-Link Chain + Royal Lion Medallion
    // Drawn in front of the open shirt collar so it is unmistakably prominent!
    ctx.save();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(0, torsoTop + 4, 11.5, 0.18, Math.PI - 0.18);
    ctx.stroke();

    // Individual bright gold chain links
    for (let i = 0; i <= 7; i++) {
      const a = 0.22 + (i / 7) * (Math.PI - 0.44);
      const lx = Math.cos(a) * 11.5;
      const ly = torsoTop + 4 + Math.sin(a) * 11.5;
      ctx.fillStyle = i % 2 === 0 ? '#ffd700' : skin.tieOrChain;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 2.3, 1.6, a + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold Lion Medallion Pendant
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, torsoTop + 18.5, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(-1.2, torsoTop + 17.2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (anim === 'bossAttack') {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.beginPath();
      ctx.arc(46, -135, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==================== 11 MAP TEMPLATES & 5-LAYER ARCHITECTURE ====================
  const MAP_TEMPLATES = {
    palace: {
      name: 'Jaipur Royal Palace',
      theme: 'royal',
      sky: ['#87B9E8', '#F5C58B'],
      ground: '#C69A70',
      atmosphere: 'warm',
      particles: 'gold_dust'
    },
    city: {
      name: 'Desi Bazaar Street',
      theme: 'urban',
      sky: ['#83B8DC', '#F6C38B'],
      ground: '#48413C',
      atmosphere: 'busy',
      particles: 'street_dust'
    },
    desert: {
      name: 'Thar Desert Kingdom',
      theme: 'desert',
      sky: ['#F7C878', '#E78A49'],
      ground: '#D6A04E',
      atmosphere: 'hot',
      particles: 'sand_particles'
    },
    jungle: {
      name: 'Sundarbans Jungle',
      theme: 'jungle',
      sky: ['#B4D9A0', '#477C54'],
      ground: '#66513B',
      atmosphere: 'humid',
      particles: 'leaves_fireflies'
    },
    fortress: {
      name: 'Chittorgarh Fortress',
      theme: 'fortress',
      sky: ['#8BB6DB', '#E9A66D'],
      ground: '#8C7963',
      atmosphere: 'historic',
      particles: 'torch_sparks'
    },
    future: {
      name: 'Neo-Bharat 2099',
      theme: 'cyberpunk',
      sky: ['#080D2B', '#25215E'],
      ground: '#11172C',
      atmosphere: 'futuristic',
      particles: 'neon_sparks'
    },
    chennai: {
      name: 'Chennai Marina & Mylapore',
      theme: 'coastal',
      sky: ['#7DC6EA', '#F8D3A0'],
      ground: '#D3B68D',
      atmosphere: 'tropical',
      particles: 'sea_spray'
    },
    coimbatore: {
      name: 'Coimbatore & Nilgiris',
      theme: 'mountain',
      sky: ['#8CC7E8', '#D4E9D2'],
      ground: '#536F3E',
      atmosphere: 'misty',
      particles: 'mist_leaves'
    },
    bengaluru: {
      name: 'Bengaluru Garden & Tech City',
      theme: 'garden_city',
      sky: ['#9CCCE8', '#F3C5A5'],
      ground: '#77766B',
      atmosphere: 'pleasant',
      particles: 'pink_petals'
    },
    hyderabad: {
      name: 'Hyderabad Charminar City',
      theme: 'heritage_city',
      sky: ['#899FC7', '#F5B58C'],
      ground: '#A68C72',
      atmosphere: 'evening',
      particles: 'warm_lights'
    },
    kochi: {
      name: 'Kochi Kerala Backwaters',
      theme: 'backwaters',
      sky: ['#8ECBD0', '#F4C69D'],
      ground: '#557F65',
      atmosphere: 'tropical',
      particles: 'water_spray'
    }
  };

  // ==================== OFFSCREEN CACHES FOR 60 FPS MOBILE/TABLET ====================
  const shadeCache = Object.create(null);
  const skyCache = { key: '', canvas: null };
  const farCache = { key: '', canvas: null, tileW: 0, tileH: 0 };
  const landmarkCache = { key: '', canvas: null, tileW: 0, tileH: 0 };
  let rupeeSprite = null;
  const powerOrbCache = Object.create(null);

  function createOffscreenCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  function getRupeeSprite() {
    if (rupeeSprite) return rupeeSprite;
    rupeeSprite = createOffscreenCanvas(20, 20);
    const sctx = rupeeSprite.getContext('2d');
    sctx.fillStyle = '#78350f';
    sctx.font = 'bold 12px sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('₹', 10, 11);
    return rupeeSprite;
  }

  function getPowerOrbSprite(powerType) {
    const key = powerType || 'default';
    if (powerOrbCache[key]) return powerOrbCache[key];
    const p = window.GAME_DATA.POWERUPS[powerType];
    const c = createOffscreenCanvas(44, 44);
    const pctx = c.getContext('2d');
    pctx.fillStyle = 'rgba(18, 14, 34, 0.88)';
    pctx.strokeStyle = p ? p.color : '#ffd700';
    pctx.lineWidth = 3;
    pctx.beginPath();
    pctx.arc(22, 22, 18, 0, Math.PI * 2);
    pctx.fill();
    pctx.stroke();
    pctx.font = '18px sans-serif';
    pctx.textAlign = 'center';
    pctx.textBaseline = 'middle';
    pctx.fillStyle = '#fff';
    pctx.fillText(p ? p.icon : '⚡', 22, 23);
    powerOrbCache[key] = c;
    return c;
  }

  function blitTiledStrip(ctx, tileCanvas, tileW, destY, width, offset) {
    const off = ((offset % tileW) + tileW) % tileW;
    for (let dx = -off; dx < width; dx += tileW) {
      ctx.drawImage(tileCanvas, dx, destY);
    }
  }

  // Layer 1: Sky, Sun/Moon, Clouds, Stars, Atmosphere (Sky/Stars/Sun cached offscreen)
  function drawSky(ctx, map, mapId, world, width, height, groundY, scrollX) {
    const cw = Math.ceil(width);
    const cg = Math.ceil(groundY);
    const key = `${mapId}|${cw}|${cg}`;
    if (skyCache.key !== key) {
      const c = skyCache.canvas && skyCache.canvas.width === cw && skyCache.canvas.height === cg
        ? skyCache.canvas
        : createOffscreenCanvas(cw, cg);
      const sctx = c.getContext('2d', { alpha: false }) || c.getContext('2d');
      const grad = sctx.createLinearGradient(0, 0, 0, cg);
      grad.addColorStop(0, map.sky[0]);
      grad.addColorStop(1, map.sky[1]);
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, cw, cg);

      if (map.theme === 'cyberpunk' || map.atmosphere === 'evening') {
        sctx.fillStyle = map.theme === 'cyberpunk' ? 'rgba(0, 245, 212, 0.42)' : 'rgba(255, 244, 214, 0.35)';
        for (let s = 0; s < 26; s++) {
          const sx = (s * 173 + 40) % cw;
          const sy = (s * 67 + 16) % (cg * 0.52);
          const sz = s % 3 === 0 ? 2 : 1.3;
          sctx.fillRect(sx, sy, sz, sz);
        }
      }

      // Sun / Cyber Moon with soft atmospheric halo
      const sunX = cw * 0.78;
      const sunY = cg * 0.22;
      const sunR = Math.min(cw, height) * 0.065;
      sctx.fillStyle = map.theme === 'cyberpunk' ? 'rgba(0, 245, 212, 0.12)' : 'rgba(255, 245, 200, 0.16)';
      sctx.beginPath();
      sctx.arc(sunX, sunY, sunR * 1.85, 0, Math.PI * 2);
      sctx.fill();
      sctx.fillStyle = map.theme === 'cyberpunk' ? 'rgba(0, 245, 212, 0.24)' : 'rgba(255, 245, 200, 0.28)';
      sctx.beginPath();
      sctx.arc(sunX, sunY, sunR * 1.32, 0, Math.PI * 2);
      sctx.fill();
      sctx.fillStyle = world.sunColor || '#fff3b0';
      sctx.beginPath();
      sctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      sctx.fill();

      skyCache.canvas = c;
      skyCache.key = key;
    }

    ctx.drawImage(skyCache.canvas, 0, 0);

    // Seamlessly drifting clouds (batched fill)
    ctx.fillStyle = map.theme === 'cyberpunk' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.26)';
    const cloudSpan = width + 320;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const cx = (((i * 340 - scrollX * 0.04) % cloudSpan) + cloudSpan) % cloudSpan - 120;
      const cy = groundY * (0.14 + (i % 2) * 0.1);
      ctx.moveTo(cx + 72, cy);
      ctx.ellipse(cx, cy, 72, 16, 0, 0, Math.PI * 2);
      ctx.moveTo(cx + 32 + 46, cy - 8);
      ctx.ellipse(cx + 32, cy - 8, 46, 14, 0, 0, Math.PI * 2);
      ctx.moveTo(cx - 28 + 34, cy - 5);
      ctx.ellipse(cx - 28, cy - 5, 34, 11, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 2: Distant Background (cached offscreen seamless tile at 0.14x parallax)
  function drawDistantBackground(ctx, mapId, world, width, groundY, scrollX) {
    const segW = 210;
    const period = 6;
    const tileW = segW * period;
    const cg = Math.ceil(groundY);
    const key = `${mapId}|${cg}`;

    if (farCache.key !== key) {
      const c = farCache.canvas && farCache.canvas.width === tileW && farCache.canvas.height === cg
        ? farCache.canvas
        : createOffscreenCanvas(tileW, cg);
      const fctx = c.getContext('2d');
      fctx.clearRect(0, 0, tileW, cg);
      fctx.fillStyle = world.farColor;

      // Render i = -1..period so overhanging hills/circles wrap seamlessly at tile edges
      for (let i = -1; i <= period; i++) {
        const wIdx = ((i % period) + period) % period;
        const x = i * segW;
        const seed = Math.abs(Math.sin(wIdx * 12.9898) * 43758.5453) % 1;
        const h = 115 + seed * 65;

        if (mapId === 'palace' || mapId === 'coimbatore' || mapId === 'desert') {
          fctx.beginPath();
          fctx.moveTo(x - 30, cg);
          fctx.quadraticCurveTo(x + segW * 0.5, cg - h * 1.05, x + segW + 30, cg);
          fctx.fill();
          if (mapId === 'desert' && wIdx % 2 === 0) {
            fctx.fillStyle = '#9e6236';
            fctx.fillRect(x + segW * 0.34, cg - h * 0.62 - 22, 66, 22);
            fctx.fillStyle = '#e63946';
            fctx.fillRect(x + segW * 0.5, cg - h * 0.62 - 34, 2, 12);
            fctx.fillRect(x + segW * 0.5 + 2, cg - h * 0.62 - 34, 9, 5);
            fctx.fillStyle = world.farColor;
          }
        } else if (mapId === 'future' || mapId === 'bengaluru' || mapId === 'city') {
          fctx.fillRect(x + 8, cg - h * 0.9, segW * 0.38, h * 0.9);
          fctx.fillRect(x + segW * 0.52, cg - h * 1.08, segW * 0.4, h * 1.08);
          if (mapId === 'future') {
            fctx.fillStyle = 'rgba(0, 245, 212, 0.22)';
            fctx.fillRect(x + 14, cg - h * 0.85, segW * 0.38 - 12, 3);
            fctx.fillRect(x + segW * 0.52 + 6, cg - h * 1.02, segW * 0.4 - 12, 3);
            fctx.fillStyle = world.farColor;
          }
        } else if (mapId === 'fortress') {
          fctx.fillRect(x + 4, cg - h * 0.62, segW - 8, h * 0.62);
          if (wIdx % 2 === 0) {
            fctx.fillRect(x + segW * 0.44, cg - h * 1.15, 22, h * 1.15);
            fctx.beginPath();
            fctx.arc(x + segW * 0.44 + 11, cg - h * 1.15, 11, Math.PI, 0);
            fctx.fill();
          }
        } else if (mapId === 'chennai') {
          fctx.fillRect(x + 10, cg - h * 0.65, segW * 0.42, h * 0.65);
          if (wIdx % 3 === 0) {
            fctx.fillStyle = '#cbd5e1';
            fctx.fillRect(x + segW * 0.64, cg - h * 1.15, 16, h * 1.15);
            fctx.fillStyle = '#e63946';
            fctx.fillRect(x + segW * 0.64, cg - h * 0.9, 16, 14);
            fctx.fillStyle = '#fde047';
            fctx.beginPath();
            fctx.arc(x + segW * 0.64 + 8, cg - h * 1.15 - 4, 6, 0, Math.PI * 2);
            fctx.fill();
            fctx.fillStyle = world.farColor;
          }
        } else if (mapId === 'kochi') {
          fctx.beginPath();
          fctx.ellipse(x + segW * 0.5, cg - 26, segW * 0.52, 22, 0, Math.PI, 0);
          fctx.fill();
          if (wIdx % 2 === 0) {
            fctx.strokeStyle = '#2d4f4a';
            fctx.lineWidth = 2.6;
            fctx.beginPath();
            fctx.moveTo(x + 42, cg - 26);
            fctx.lineTo(x + 98, cg - 102);
            fctx.lineTo(x + 142, cg - 48);
            fctx.moveTo(x + 98, cg - 102);
            fctx.lineTo(x + 68, cg - 56);
            fctx.stroke();
          }
        } else {
          fctx.beginPath();
          fctx.arc(x + segW * 0.28, cg - h * 0.46, 52, 0, Math.PI * 2);
          fctx.arc(x + segW * 0.72, cg - h * 0.52, 58, 0, Math.PI * 2);
          fctx.fill();
        }
      }

      farCache.canvas = c;
      farCache.key = key;
      farCache.tileW = tileW;
      farCache.tileH = cg;
    }

    blitTiledStrip(ctx, farCache.canvas, farCache.tileW, 0, width, scrollX * 0.14);
  }

  // Layer 3: Dedicated Per-Map Landmark Renderers with Deep Interiors (0.42x parallax)
  function drawJaipurLandmarks(ctx, width, groundY, offset, time) {
    const segW = 196;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 136 + (Math.abs(idx) % 2) * 20;

      // Pink-sandstone haveli facade with cornice & carved parapet
      ctx.fillStyle = '#e6a685';
      ctx.fillRect(x + 6, groundY - h, segW - 12, h);
      ctx.fillStyle = '#d48d6a';
      ctx.fillRect(x + 6, groundY - h, segW - 12, 10);
      ctx.fillStyle = '#f6dfc5';
      ctx.fillRect(x + 4, groundY - h - 5, segW - 8, 6);

      // Central Rajputana onion dome + flanking chhatri domes with golden kalash
      [
        [x + segW * 0.5, 28, 12],
        [x + 30, 14, 7],
        [x + segW - 30, 14, 7]
      ].forEach(([dx, r, kh]) => {
        ctx.fillStyle = '#d98a6c';
        ctx.beginPath();
        ctx.arc(dx, groundY - h - 5, r, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(dx - 1.5, groundY - h - 5 - r - kh, 3, kh);
      });

      // Deep recessed palace arches with interior colonnade, warm chandelier & royal drapes
      for (let a = 0; a < 3; a++) {
        const ax = x + 20 + a * 54;
        const aw = 34;
        const archTop = groundY - h * 0.58;
        // Deep warm interior background
        ctx.fillStyle = '#3c1816';
        ctx.beginPath();
        ctx.arc(ax + aw * 0.5, archTop, aw * 0.5, Math.PI, 0);
        ctx.lineTo(ax + aw, groundY - 8);
        ctx.lineTo(ax, groundY - 8);
        ctx.closePath();
        ctx.fill();
        // Warm golden inner palace glow
        ctx.fillStyle = 'rgba(255, 200, 110, 0.28)';
        ctx.beginPath();
        ctx.arc(ax + aw * 0.5, archTop + 12, 13, 0, Math.PI * 2);
        ctx.fill();
        // Hanging brass chandelier inside arch
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ax + aw * 0.5, archTop - 12);
        ctx.lineTo(ax + aw * 0.5, archTop + 2);
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(ax + aw * 0.5, archTop + 3, 3, 0, Math.PI * 2);
        ctx.fill();
        // Crimson royal curtains tied to sides
        ctx.fillStyle = '#9b2226';
        ctx.fillRect(ax + 1, archTop, 6, groundY - archTop - 18);
        ctx.fillRect(ax + aw - 7, archTop, 6, groundY - archTop - 18);
        // Marble balustrade railing at bottom of arch
        ctx.fillStyle = '#f6dfc5';
        ctx.fillRect(ax, groundY - 18, aw, 10);
        ctx.fillStyle = '#b45309';
        for (let b = 4; b < aw - 4; b += 7) {
          ctx.fillRect(ax + b, groundY - 16, 3, 6);
        }
      }

      // Upper Jharokha jaali lattice windows
      ctx.fillStyle = '#4a1d19';
      for (let w = 0; w < 3; w++) {
        const wx = x + 28 + w * 54;
        ctx.fillRect(wx, groundY - h + 18, 18, 18);
        ctx.fillStyle = 'rgba(255, 215, 130, 0.45)';
        ctx.fillRect(wx + 3, groundY - h + 21, 5, 12);
        ctx.fillRect(wx + 10, groundY - h + 21, 5, 12);
        ctx.fillStyle = '#4a1d19';
      }

      // Carved sandstone foreground pillars
      ctx.fillStyle = '#f6dfc5';
      ctx.fillRect(x + 8, groundY - 72, 8, 72);
      ctx.fillRect(x + segW - 16, groundY - 72, 8, 72);
    }
  }

  const SHOP_SIGNS = ['CHAI', 'SWEETS', 'MASALE', 'FASHION', 'SAREES'];
  const SHOP_COLORS = ['#d97b66', '#e59882', '#c8644f', '#e08e79', '#d4745e'];

  function drawBazaarLandmarks(ctx, width, groundY, offset) {
    const segW = 200;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const wIdx = ((idx % 15) + 15) % 15;
      const x = idx * segW - offset;
      const color = SHOP_COLORS[wIdx % SHOP_COLORS.length];
      const sign = SHOP_SIGNS[wIdx % SHOP_SIGNS.length];
      const bldgH = 172 + ((wIdx * 37) % 3) * 18;

      ctx.fillStyle = color;
      ctx.fillRect(x + 2, groundY - bldgH, segW - 4, bldgH - 10);

      // Overhead utility wires
      ctx.strokeStyle = 'rgba(40, 25, 20, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, groundY - bldgH + 14);
      ctx.quadraticCurveTo(x + segW * 0.5, groundY - bldgH + 28, x + segW, groundY - bldgH + 14);
      ctx.stroke();

      // Upper Jharokha windows with warm lit interiors & window sills
      for (let a = 0; a < 3; a++) {
        const ax = x + 22 + a * 54;
        const ay = groundY - bldgH + 34;
        ctx.fillStyle = '#3b1c14';
        ctx.beginPath();
        ctx.arc(ax + 14, ay, 14, Math.PI, 0);
        ctx.lineTo(ax + 28, ay + 24);
        ctx.lineTo(ax, ay + 24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = a % 2 === 0 ? 'rgba(255, 214, 120, 0.55)' : 'rgba(255, 190, 90, 0.32)';
        ctx.fillRect(ax + 5, ay - 2, 18, 22);
        ctx.fillStyle = '#fae1d8';
        ctx.fillRect(ax - 2, ay + 24, 32, 3);
      }

      // Shop Signboard
      ctx.fillStyle = '#fff8ef';
      ctx.fillRect(x + 16, groundY - 98, segW - 32, 21);
      ctx.strokeStyle = '#8b2e20';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 16, groundY - 98, segW - 32, 21);
      ctx.fillStyle = '#7a1c14';
      ctx.font = 'bold 11px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sign, x + segW * 0.5, groundY - 83);

      // Deep Shop Interior (lit back wall, shelves, goods, counter & awning)
      const ix = x + 16;
      const iy = groundY - 72;
      const iw = segW - 32;
      const ih = 62;
      ctx.fillStyle = '#2b150e';
      ctx.fillRect(ix, iy, iw, ih);
      // Warm interior back-wall glow
      ctx.fillStyle = 'rgba(255, 196, 100, 0.18)';
      ctx.fillRect(ix + 6, iy + 6, iw - 12, ih - 12);
      // Hanging warm shop bulb
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(ix + iw * 0.5, iy + 11, 4, 0, Math.PI * 2);
      ctx.fill();
      // Wooden display shelves & shop-specific goods
      ctx.fillStyle = '#6b3e1b';
      ctx.fillRect(ix + 8, iy + 22, iw - 16, 3);
      ctx.fillRect(ix + 8, iy + 36, iw - 16, 3);
      if (sign === 'CHAI') {
        // Brass tea kettle + steaming cups on counter
        ctx.fillStyle = '#d97706';
        ctx.fillRect(ix + 20, iy + 29, 14, 14);
        ctx.fillStyle = '#f8fafc';
        for (let c = 0; c < 4; c++) ctx.fillRect(ix + 54 + c * 14, iy + 31, 6, 6);
      } else if (sign === 'SWEETS') {
        // Colourful Mithai trays (Ladoo, Barfi, Jalebi)
        const sweetCols = ['#f59e0b', '#fb7185', '#fde047', '#f8fafc'];
        for (let s = 0; s < 4; s++) {
          ctx.fillStyle = sweetCols[s];
          ctx.fillRect(ix + 16 + s * 34, iy + 15, 22, 7);
          ctx.fillRect(ix + 16 + s * 34, iy + 29, 22, 7);
        }
      } else if (sign === 'MASALE') {
        // Colourful spice jars & open spice sacks
        const spiceCols = ['#dc2626', '#eab308', '#16a34a', '#ea580c', '#9333ea'];
        for (let sp = 0; sp < 5; sp++) {
          ctx.fillStyle = spiceCols[sp];
          ctx.fillRect(ix + 14 + sp * 28, iy + 13, 14, 9);
          ctx.beginPath();
          ctx.arc(ix + 21 + sp * 28, iy + 48, 9, Math.PI, 0);
          ctx.fill();
        }
      } else {
        // Hanging colourful Sarees / Kurta fabrics on racks
        const fabCols = ['#e11d48', '#2563eb', '#eab308', '#10b981', '#a855f7'];
        for (let f = 0; f < 5; f++) {
          ctx.fillStyle = fabCols[f];
          ctx.fillRect(ix + 16 + f * 28, iy + 14, 16, 28);
        }
      }
      // Wooden shop counter at bottom
      ctx.fillStyle = '#8d5524';
      ctx.fillRect(ix, iy + ih - 14, iw, 14);
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(ix, iy + ih - 14, iw, 3);
      // Striped cloth awning (Chhajja) + Marigold Toran
      for (let st = 0; st < 6; st++) {
        ctx.fillStyle = st % 2 === 0 ? '#b91c1c' : '#fef3c7';
        ctx.fillRect(ix + st * (iw / 6), iy, iw / 6, 8);
      }
      ctx.fillStyle = '#ff9f1c';
      for (let g = 0; g < 7; g++) {
        ctx.beginPath();
        ctx.arc(ix + 12 + g * 23, iy + 11 + Math.sin(g) * 2.5, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawTharLandmarks(ctx, width, groundY, offset) {
    const segW = 220;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 76 + (Math.abs(idx) % 2) * 26;
      // Sculpted sunlit & shaded sand dune
      ctx.fillStyle = '#e0a958';
      ctx.beginPath();
      ctx.moveTo(x - 30, groundY);
      ctx.quadraticCurveTo(x + segW * 0.5, groundY - h, x + segW + 30, groundY);
      ctx.fill();
      ctx.fillStyle = '#c48636';
      ctx.beginPath();
      ctx.moveTo(x + segW * 0.5, groundY - h * 0.52);
      ctx.lineTo(x + segW + 30, groundY);
      ctx.lineTo(x + segW * 0.34, groundY);
      ctx.closePath();
      ctx.fill();
      // Golden Jaisalmer sandstone haveli / camel caravan on alternate dunes
      if (Math.abs(idx) % 2 === 0) {
        ctx.fillStyle = '#6b3e1b';
        ctx.fillRect(x + 62, groundY - h * 0.55 - 12, 14, 7);
        ctx.fillRect(x + 64, groundY - h * 0.55 - 5, 2.5, 8);
        ctx.fillRect(x + 72, groundY - h * 0.55 - 5, 2.5, 8);
        ctx.fillRect(x + 75, groundY - h * 0.55 - 17, 3, 8);
      } else {
        // Carved sandstone desert watchtower with recessed lit archway
        ctx.fillStyle = '#c98d44';
        ctx.fillRect(x + 86, groundY - 68, 48, 68);
        ctx.fillStyle = '#4a2810';
        ctx.beginPath();
        ctx.arc(x + 110, groundY - 28, 12, Math.PI, 0);
        ctx.lineTo(x + 122, groundY);
        ctx.lineTo(x + 98, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 100, 0.45)';
        ctx.beginPath();
        ctx.arc(x + 110, groundY - 22, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawSundarbansLandmarks(ctx, width, groundY, offset) {
    // Winding Sundarbans jungle river strip (period 92.5 divides 370px tile seamlessly)
    ctx.fillStyle = '#2d7a78';
    ctx.fillRect(0, groundY - 24, width, 24);
    ctx.fillStyle = 'rgba(216, 243, 220, 0.28)';
    for (let rx = -(offset % 92.5); rx < width + 92.5; rx += 92.5) {
      ctx.fillRect(rx, groundY - 14, 34, 2);
    }
    const segW = 185;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 118 + (Math.abs(idx) % 2) * 20;
      // Mossy ancient temple ruin shrine with glowing inner oil lamp on alternate segments
      if (Math.abs(idx) % 2 === 1) {
        ctx.fillStyle = '#57534e';
        ctx.fillRect(x + 18, groundY - 64, 52, 64);
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(x + 44, groundY - 26, 13, Math.PI, 0);
        ctx.lineTo(x + 57, groundY);
        ctx.lineTo(x + 31, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + 44, groundY - 14, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Banyan trunk & hanging aerial prop roots
      ctx.fillStyle = '#3d2b1f';
      ctx.fillRect(x + segW * 0.56, groundY - h * 0.72, 16, h * 0.72);
      ctx.fillRect(x + segW * 0.4, groundY - h * 0.62, 3, h * 0.62);
      ctx.fillRect(x + segW * 0.78, groundY - h * 0.58, 3, h * 0.58);
      // Sunlit & deep shaded canopy layers
      ctx.fillStyle = '#1f4d32';
      ctx.beginPath();
      ctx.arc(x + segW * 0.6, groundY - h * 0.76, 46, 0, Math.PI * 2);
      ctx.arc(x + segW * 0.4, groundY - h * 0.66, 28, 0, Math.PI * 2);
      ctx.arc(x + segW * 0.8, groundY - h * 0.66, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d7a47';
      ctx.beginPath();
      ctx.arc(x + segW * 0.56, groundY - h * 0.82, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawChittorgarhLandmarks(ctx, width, groundY, offset, time) {
    const segW = 190;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 114 + (Math.abs(idx) % 2) * 16;
      ctx.fillStyle = '#8d7563';
      ctx.fillRect(x + 6, groundY - h, segW - 12, h);
      // Stone masonry courses
      ctx.strokeStyle = 'rgba(50, 35, 25, 0.25)';
      ctx.lineWidth = 1.2;
      for (let sy = groundY - h + 20; sy < groundY; sy += 22) {
        ctx.beginPath();
        ctx.moveTo(x + 6, sy);
        ctx.lineTo(x + segW - 6, sy);
        ctx.stroke();
      }
      // Stone battlements
      ctx.fillStyle = '#8d7563';
      for (let m = 0; m < 5; m++) {
        ctx.fillRect(x + 8 + m * 35, groundY - h - 12, 18, 12);
      }
      // Deep Pol arched gateway with inner stone corridor & iron-studded wooden gate
      const gx = x + segW * 0.5;
      ctx.fillStyle = '#241714';
      ctx.beginPath();
      ctx.arc(gx, groundY - 42, 26, Math.PI, 0);
      ctx.lineTo(gx + 26, groundY);
      ctx.lineTo(gx - 26, groundY);
      ctx.closePath();
      ctx.fill();
      // Warm inner courtyard firelight + wooden gate doors
      ctx.fillStyle = 'rgba(255, 140, 40, 0.28)';
      ctx.beginPath();
      ctx.arc(gx, groundY - 24, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5c3419';
      ctx.fillRect(gx - 24, groundY - 42, 10, 42);
      ctx.fillRect(gx + 14, groundY - 42, 10, 42);
      // Mashal torch brackets (flames drawn dynamically)
      ctx.fillStyle = '#3b2416';
      ctx.fillRect(x + 24, groundY - h * 0.48 + 4, 4, 14);
      ctx.fillRect(x + segW - 28, groundY - h * 0.48 + 4, 4, 14);
    }
  }

  function drawNeoBharatLandmarks(ctx, width, groundY, offset, time) {
    const segW = 170;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 122 + (Math.abs(idx * 23) % 3) * 24;
      ctx.fillStyle = '#141a42';
      ctx.fillRect(x + 10, groundY - h, segW - 20, h);
      // Deep illuminated cyber interior floors & glass atrium windows
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      for (let fy = groundY - h + 18; fy < groundY - 12; fy += 16) {
        ctx.fillRect(x + 22, fy, segW - 44, 6);
      }
      // Cyber lotus crown
      ctx.fillStyle = '#d946ef';
      ctx.beginPath();
      ctx.moveTo(x + segW * 0.5 - 18, groundY - h);
      ctx.lineTo(x + segW * 0.5, groundY - h - 22);
      ctx.lineTo(x + segW * 0.5 + 18, groundY - h);
      ctx.closePath();
      ctx.fill();
      // Cyan neon strips
      ctx.fillStyle = 'rgba(0, 245, 212, 0.65)';
      ctx.fillRect(x + 18, groundY - h + 10, segW - 36, 3);
      ctx.fillRect(x + segW * 0.5 - 2, groundY - h + 20, 4, h - 28);
    }
  }

  function drawChennaiLandmarks(ctx, width, groundY, offset) {
    // Bay of Bengal shimmering ocean + surf waves (period 97.5 divides 390px tile seamlessly)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, groundY - 32, width, 32);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let wx = -(offset % 97.5); wx < width + 97.5; wx += 97.5) {
      ctx.beginPath();
      ctx.ellipse(wx + 24, groundY - 15, 26, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const segW = 195;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 116;
      const baseW = segW * 0.54;
      for (let t = 0; t < 5; t++) {
        const tw = baseW * (1 - t * 0.16);
        const th = h / 5;
        const tx = x + (segW - tw) * 0.5;
        const ty = groundY - (t + 1) * th - 30;
        ctx.fillStyle = t % 2 === 1 ? '#e76f51' : '#f4a261';
        ctx.fillRect(tx, ty, tw, th + 1);
        // Sculpted temple niches inside each tier
        ctx.fillStyle = '#5c1d16';
        ctx.fillRect(tx + tw * 0.42, ty + 4, tw * 0.16, th - 6);
      }
      // Recessed sanctum entrance with warm oil-lamp diya glow
      ctx.fillStyle = '#29150b';
      ctx.fillRect(x + segW * 0.5 - 12, groundY - 54, 24, 24);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x + segW * 0.5, groundY - 38, 4, 0, Math.PI * 2);
      ctx.fill();
      // Golden Kalasam finial
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x + segW * 0.5 - 2, groundY - h - 40, 4, 10);
    }
  }

  function drawCoimbatoreLandmarks(ctx, width, groundY, offset, time) {
    const segW = 210;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const h = 104 + (Math.abs(idx) % 2) * 18;
      // Terraced tea plantation hill
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.moveTo(x - 24, groundY);
      ctx.quadraticCurveTo(x + segW * 0.5, groundY - h, x + segW + 24, groundY);
      ctx.fill();
      ctx.strokeStyle = 'rgba(183, 228, 199, 0.36)';
      ctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) {
        const ry = groundY - h * (0.24 + r * 0.16);
        ctx.beginPath();
        ctx.moveTo(x + 12, ry + 10);
        ctx.quadraticCurveTo(x + segW * 0.5, ry - 12, x + segW - 12, ry + 10);
        ctx.stroke();
      }
      // Tea-estate cottage with warm lit windows
      if (Math.abs(idx) % 2 === 0) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 92, groundY - 32, 34, 32);
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(x + 88, groundY - 32);
        ctx.lineTo(x + 109, groundY - 46);
        ctx.lineTo(x + 130, groundY - 32);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 98, groundY - 22, 8, 8);
        ctx.fillRect(x + 112, groundY - 22, 8, 8);
      }
      // Silver-oak shade tree
      ctx.fillStyle = '#3d2b1f';
      ctx.fillRect(x + 28, groundY - 56, 5, 56);
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.arc(x + 30.5, groundY - 62, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    // Nilgiri stone arch viaduct (mountain train drawn dynamically)
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(0, groundY - 54, width, 7);
  }

  function drawBengaluruLandmarks(ctx, width, groundY, offset) {
    const segW = 200;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      // Vidhana Soudha pillared granite facade & central dome
      ctx.fillStyle = '#c9b79c';
      ctx.fillRect(x + 14, groundY - 98, segW - 28, 98);
      ctx.beginPath();
      ctx.arc(x + segW * 0.5, groundY - 98, 24, Math.PI, 0);
      ctx.fill();
      // Deep recessed legislative hall windows & shadowed portico
      ctx.fillStyle = '#3d3328';
      ctx.fillRect(x + 24, groundY - 82, segW - 48, 82);
      ctx.fillStyle = 'rgba(255, 224, 150, 0.48)';
      for (let w = 0; w < 4; w++) {
        ctx.fillRect(x + 34 + w * 34, groundY - 72, 14, 20);
        ctx.fillRect(x + 34 + w * 34, groundY - 40, 14, 24);
      }
      // Classical granite pillars in front of recessed portico
      ctx.fillStyle = '#d6c7b2';
      for (let p = 0; p < 5; p++) {
        ctx.fillRect(x + 24 + p * 34, groundY - 84, 7, 84);
      }
      // Blooming pink Tabebuia trees
      ctx.fillStyle = '#3b2820';
      ctx.fillRect(x + 12, groundY - 40, 5, 40);
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(x + 14, groundY - 48, 18, 0, Math.PI * 2);
      ctx.arc(x + 28, groundY - 42, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHyderabadLandmarks(ctx, width, groundY, offset) {
    // Hussain Sagar Lake reflection strip
    ctx.fillStyle = 'rgba(79, 70, 229, 0.36)';
    ctx.fillRect(0, groundY - 22, width, 22);
    const segW = 200;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const cx = x + segW * 0.5;
      // Charminar main body & 4 corner minarets
      ctx.fillStyle = '#d9c5b2';
      ctx.fillRect(x + 32, groundY - 78, segW - 64, 64);
      [x + 26, x + segW - 38].forEach(mx => {
        ctx.fillStyle = '#d9c5b2';
        ctx.fillRect(mx, groundY - 128, 12, 114);
        ctx.fillStyle = '#a68c72';
        ctx.fillRect(mx - 2, groundY - 94, 16, 4);
        ctx.fillRect(mx - 2, groundY - 112, 16, 4);
        ctx.fillStyle = '#d9c5b2';
        ctx.beginPath();
        ctx.arc(mx + 6, groundY - 128, 8, Math.PI, 0);
        ctx.fill();
      });
      // Deep vaulted Charminar interior arch + hanging fanoos chandelier + pearl shop glow
      ctx.fillStyle = '#2d1c2e';
      ctx.beginPath();
      ctx.arc(cx, groundY - 40, 22, Math.PI, 0);
      ctx.lineTo(cx + 22, groundY - 14);
      ctx.lineTo(cx - 22, groundY - 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 220, 140, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, groundY - 34, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, groundY - 44, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawKochiLandmarks(ctx, width, groundY, offset) {
    // Emerald Kerala Backwater canal (period 87.5 divides 350px tile seamlessly; houseboats drawn dynamically)
    ctx.fillStyle = '#0d6e66';
    ctx.fillRect(0, groundY - 36, width, 36);
    ctx.fillStyle = 'rgba(100, 223, 223, 0.25)';
    for (let rx = -(offset % 87.5); rx < width + 87.5; rx += 87.5) {
      ctx.fillRect(rx, groundY - 22, 34, 2);
    }
    // Leaning coconut palms along canal bank
    const segW = 175;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      ctx.strokeStyle = '#5c4033';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x + segW * 0.48, groundY - 22);
      ctx.quadraticCurveTo(x + segW * 0.56, groundY - 76, x + segW * 0.5, groundY - 120);
      ctx.stroke();
      ctx.fillStyle = '#15803d';
      for (let f = -2; f <= 2; f++) {
        ctx.beginPath();
        ctx.ellipse(x + segW * 0.5 + f * 14, groundY - 120, 22, 5.5, f * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const LANDMARK_TILE_SPECS = {
    palace: { segW: 196, period: 2, fn: drawJaipurLandmarks },
    city: { segW: 200, period: 15, fn: drawBazaarLandmarks },
    desert: { segW: 220, period: 2, fn: drawTharLandmarks },
    jungle: { segW: 185, period: 2, fn: drawSundarbansLandmarks },
    fortress: { segW: 190, period: 2, fn: drawChittorgarhLandmarks },
    future: { segW: 170, period: 3, fn: drawNeoBharatLandmarks },
    chennai: { segW: 195, period: 2, fn: drawChennaiLandmarks },
    coimbatore: { segW: 210, period: 2, fn: drawCoimbatoreLandmarks },
    bengaluru: { segW: 200, period: 2, fn: drawBengaluruLandmarks },
    hyderabad: { segW: 200, period: 2, fn: drawHyderabadLandmarks },
    kochi: { segW: 175, period: 2, fn: drawKochiLandmarks }
  };

  function drawLandmarks(ctx, mapId, width, groundY, scrollX, time) {
    const offset = scrollX * 0.42;
    const spec = LANDMARK_TILE_SPECS[mapId] || LANDMARK_TILE_SPECS.palace;
    const tileW = spec.segW * spec.period;
    const tileH = Math.min(Math.ceil(groundY), 260);
    const key = `${mapId}|${tileH}`;

    if (landmarkCache.key !== key) {
      const c = landmarkCache.canvas && landmarkCache.canvas.width === tileW && landmarkCache.canvas.height === tileH
        ? landmarkCache.canvas
        : createOffscreenCanvas(tileW, tileH);
      const lctx = c.getContext('2d');
      lctx.clearRect(0, 0, tileW, tileH);
      lctx.save();
      // Translate so existing landmark functions draw relative to bottom = tileH
      // and pass width = tileW, groundY = tileH, offset = 0
      spec.fn(lctx, tileW, tileH, 0, 0);
      lctx.restore();

      landmarkCache.canvas = c;
      landmarkCache.key = key;
      landmarkCache.tileW = tileW;
      landmarkCache.tileH = tileH;
    }

    blitTiledStrip(ctx, landmarkCache.canvas, landmarkCache.tileW, groundY - landmarkCache.tileH, width, offset);

    // Lightweight dynamic foreground details for maps with animated elements
    if (mapId === 'fortress') {
      const segW = 190;
      const startIdx = Math.floor(offset / segW) - 1;
      const count = Math.ceil(width / segW) + 3;
      ctx.fillStyle = '#ff6b00';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const idx = startIdx + i;
        const x = idx * segW - offset;
        const h = 114 + (Math.abs(idx) % 2) * 16;
        const flick = Math.sin(time * 18 + idx) * 2;
        ctx.moveTo(x + 26 + 6, groundY - h * 0.48 + flick * 0.4);
        ctx.arc(x + 26, groundY - h * 0.48 + flick * 0.4, 6, 0, Math.PI * 2);
        ctx.moveTo(x + segW - 26 + 6, groundY - h * 0.48 - flick * 0.4);
        ctx.arc(x + segW - 26, groundY - h * 0.48 - flick * 0.4, 6, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const idx = startIdx + i;
        const x = idx * segW - offset;
        const h = 114 + (Math.abs(idx) % 2) * 16;
        ctx.moveTo(x + 26 + 2.8, groundY - h * 0.48);
        ctx.arc(x + 26, groundY - h * 0.48, 2.8, 0, Math.PI * 2);
        ctx.moveTo(x + segW - 26 + 2.8, groundY - h * 0.48);
        ctx.arc(x + segW - 26, groundY - h * 0.48, 2.8, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (mapId === 'future') {
      const flyX = ((time * 140) % (width + 160)) - 80;
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(flyX, groundY - 148, 28, 6);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(width - flyX, groundY - 118, 24, 5);
    } else if (mapId === 'coimbatore') {
      const trainX = ((time * 95) % (width + 200)) - 100;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(trainX, groundY - 66, 48, 12);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(trainX + 6, groundY - 62, 6, 4);
      ctx.fillRect(trainX + 16, groundY - 62, 6, 4);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(trainX + 52, groundY - 65, 42, 11);
    } else if (mapId === 'kochi') {
      const boatOff = offset * 0.72;
      for (let bx = -(boatOff % 360); bx < width + 360; bx += 360) {
        ctx.fillStyle = '#4a2c11';
        ctx.beginPath();
        ctx.moveTo(bx + 14, groundY - 13);
        ctx.lineTo(bx + 126, groundY - 13);
        ctx.lineTo(bx + 108, groundY - 2);
        ctx.lineTo(bx + 32, groundY - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(bx + 70, groundY - 13, 28, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(bx + 48, groundY - 26, 9, 8);
        ctx.fillRect(bx + 64, groundY - 26, 9, 8);
        ctx.fillRect(bx + 80, groundY - 26, 9, 8);
      }
    }
  }

  // Layer 4: Gameplay Ground & Road Foreground
  function drawGround(ctx, map, mapId, world, width, height, groundY, scrollX) {
    ctx.fillStyle = map.ground || world.groundBody;
    ctx.fillRect(0, groundY, width, height - groundY);

    if (mapId === 'city' || mapId === 'bengaluru') {
      ctx.fillStyle = mapId === 'city' ? '#b85d4b' : '#64748b';
      ctx.fillRect(0, groundY - 10, width, 12);
      ctx.fillStyle = '#3f4754';
      ctx.fillRect(0, groundY + 2, width, height - groundY);
      ctx.fillStyle = '#f8f9fa';
      const dashGap = 70;
      const dashOffset = scrollX % dashGap;
      for (let gx = -dashOffset; gx < width + dashGap; gx += dashGap) {
        ctx.fillRect(gx, groundY + 38, 36, 5);
      }
    } else if (mapId === 'future') {
      ctx.fillStyle = '#1b2244';
      ctx.fillRect(0, groundY, width, 14);
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(width, groundY + 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.22)';
      ctx.lineWidth = 1.2;
      const gridW = 76;
      const offset = scrollX % gridW;
      ctx.beginPath();
      for (let gx = -offset; gx < width + gridW; gx += gridW) {
        ctx.moveTo(gx, groundY + 2);
        ctx.lineTo(gx - 28, groundY + 56);
      }
      ctx.stroke();
    } else if (mapId === 'palace' || mapId === 'hyderabad' || mapId === 'fortress') {
      ctx.fillStyle = world.groundTop;
      ctx.fillRect(0, groundY, width, 16);
      ctx.fillStyle = mapId === 'palace' ? 'rgba(255, 215, 0, 0.35)' : 'rgba(255, 255, 255, 0.14)';
      ctx.fillRect(0, groundY, width, 3);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 1.5;
      const tileW = 72;
      const offset = scrollX % tileW;
      ctx.beginPath();
      for (let gx = -offset; gx < width + tileW; gx += tileW) {
        ctx.moveTo(gx, groundY);
        ctx.lineTo(gx - 18, groundY + 46);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = world.groundTop;
      ctx.fillRect(0, groundY, width, 15);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      const tileW = 68;
      const offset = scrollX % tileW;
      for (let gx = -offset; gx < width + tileW; gx += tileW) {
        ctx.fillRect(gx, groundY + 18, 28, 5);
        ctx.fillRect(gx + 34, groundY + 34, 20, 4);
      }
    }
  }

  // Layer 5: Environmental Particles & Atmosphere Effects (single batched draw call)
  const ENV_COLOR_MAP = {
    gold_dust: 'rgba(255, 215, 0, 0.55)',
    street_dust: 'rgba(255, 230, 190, 0.35)',
    sand_particles: 'rgba(244, 180, 90, 0.55)',
    leaves_fireflies: 'rgba(190, 242, 100, 0.72)',
    torch_sparks: 'rgba(255, 140, 40, 0.75)',
    neon_sparks: 'rgba(0, 245, 212, 0.7)',
    sea_spray: 'rgba(224, 242, 254, 0.65)',
    mist_leaves: 'rgba(255, 255, 255, 0.32)',
    pink_petals: 'rgba(244, 114, 182, 0.78)',
    warm_lights: 'rgba(253, 224, 71, 0.6)',
    water_spray: 'rgba(186, 230, 253, 0.6)'
  };

  function drawEnvironmentEffects(ctx, map, width, groundY, scrollX, time) {
    const pType = map.particles;
    ctx.fillStyle = ENV_COLOR_MAP[pType] || 'rgba(255, 255, 255, 0.35)';
    const r = pType === 'pink_petals' ? 3.2 : 2.1;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const px = (((i * 157 - scrollX * 0.55 - time * 35) % width) + width) % width;
      const py = groundY * (0.28 + ((i * 53) % 65) / 100) + Math.sin(time * 2.5 + i) * 10;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Unified 5-Layer Render Entry Point (matches existing game.js signature)
  function drawBackground(ctx, width, height, groundY, world, scrollX, time) {
    const mapId = world.id;
    const map = MAP_TEMPLATES[mapId] || MAP_TEMPLATES.palace;
    drawSky(ctx, map, mapId, world, width, height, groundY, scrollX);
    drawDistantBackground(ctx, mapId, world, width, groundY, scrollX);
    drawLandmarks(ctx, mapId, width, groundY, scrollX, time);
    drawGround(ctx, map, mapId, world, width, height, groundY, scrollX);
    drawEnvironmentEffects(ctx, map, width, groundY, scrollX, time);
  }

  // ==================== REALISTIC INDIAN OBSTACLES ====================
  function drawObstacle(ctx, obs, time) {
    const { x, y, w, h, kind } = obs;
    ctx.save();

    // Soft ground shadow under ground obstacles
    if (!obs.isAir && kind !== 'water_puddle') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h + 2, w * 0.48, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    switch (kind) {
      case 'moving_vehicle':
        // Iconic Yellow & Black Indian Auto-Rickshaw (3-Wheeler CNG)
        // Warm headlight beam
        ctx.fillStyle = 'rgba(254, 240, 138, 0.24)';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + h * 0.56);
        ctx.lineTo(x - 46, y + h * 0.36);
        ctx.lineTo(x - 46, y + h * 0.84);
        ctx.closePath();
        ctx.fill();
        // Black curved canvas hood
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + h * 0.44);
        ctx.lineTo(x + 20, y + 4);
        ctx.quadraticCurveTo(x + w * 0.58, y - 2, x + w - 8, y + 6);
        ctx.lineTo(x + w - 4, y + h * 0.48);
        ctx.closePath();
        ctx.fill();
        // Roof rib highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 36, y + 3);
        ctx.lineTo(x + 36, y + h * 0.42);
        ctx.moveTo(x + 60, y + 4);
        ctx.lineTo(x + 60, y + h * 0.42);
        ctx.stroke();
        // Driver silhouette inside cabin
        ctx.fillStyle = '#c27848';
        ctx.beginPath();
        ctx.arc(x + 26, y + 17, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 21, y + 23, 10, 13);
        // Slanted front windshield with sky reflection
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(x + 6, y + h * 0.44);
        ctx.lineTo(x + 16, y + 7);
        ctx.lineTo(x + 21, y + 7);
        ctx.lineTo(x + 13, y + h * 0.44);
        ctx.closePath();
        ctx.fill();
        // Lower yellow & green CNG body
        ctx.fillStyle = '#eab308';
        roundRect(ctx, x, y + h * 0.43, w, h * 0.44, 8);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 2, y + h * 0.63, w - 4, 6);
        // Chrome front fender & bumper
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(x - 2, y + h * 0.78, 12, 4);
        // Tires with silver rims & hubcaps
        [x + 14, x + w - 15].forEach(wx => {
          ctx.fillStyle = '#111111';
          ctx.beginPath();
          ctx.arc(wx, y + h - 6, 8.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d4d4d8';
          ctx.beginPath();
          ctx.arc(wx, y + h - 6, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#52525b';
          ctx.beginPath();
          ctx.arc(wx, y + h - 6, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Glowing Headlight
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + 2, y + h * 0.56, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'wooden_box':
        // Heavy Royal Cargo Crate with planks, diagonal brace & brass rivets
        ctx.fillStyle = '#9c6644';
        roundRect(ctx, x, y, w, h, 4);
        ctx.fill();
        ctx.fillStyle = '#7f5539';
        ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
        // Horizontal wood plank seams
        ctx.strokeStyle = '#4a2c11';
        ctx.lineWidth = 1.6;
        for (let py = y + 14; py < y + h - 6; py += 12) {
          ctx.beginPath();
          ctx.moveTo(x + 4, py);
          ctx.lineTo(x + w - 4, py);
          ctx.stroke();
        }
        // Outer wooden frame & diagonal brace
        ctx.lineWidth = 3.2;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        ctx.strokeStyle = '#b08968';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + w - 5, y + h - 5);
        ctx.stroke();
        // Brass corner brackets
        ctx.fillStyle = '#d4af37';
        [[x + 2, y + 2], [x + w - 8, y + 2], [x + 2, y + h - 8], [x + w - 8, y + h - 8]].forEach(([bx, by]) => {
          ctx.fillRect(bx, by, 6, 6);
        });
        break;

      case 'palace_barrier':
        // Ornate Royal Sandstone & Gold-Tipped Palace Barricade
        ctx.fillStyle = '#7f1d1d';
        roundRect(ctx, x + 4, y + 10, w - 8, h - 10, 4);
        ctx.fill();
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(x + 6, y + 14, w - 12, 10);
        // Gold chevron trim
        ctx.fillStyle = '#ffd700';
        for (let sx = x + 8; sx < x + w - 8; sx += 14) {
          ctx.fillRect(sx, y + 16, 7, 6);
        }
        // Twin turned wooden pillars with brass finials
        [x + 4, x + w - 10].forEach(px => {
          ctx.fillStyle = '#4a2511';
          ctx.fillRect(px, y + 6, 6, h - 6);
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(px + 3, y);
          ctx.lineTo(px + 7, y + 7);
          ctx.lineTo(px - 1, y + 7);
          ctx.closePath();
          ctx.fill();
        });
        break;

      case 'traffic_barricade':
        // Indian Steel Police/Traffic Barricade with Hazard Stripes & Amber Beacon
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 5, y + 10, 4, h - 10);
        ctx.fillRect(x + w - 9, y + 10, 4, h - 10);
        ctx.fillRect(x + 2, y + h - 4, 12, 4);
        ctx.fillRect(x + w - 14, y + h - 4, 12, 4);
        ctx.fillStyle = '#f59e0b';
        roundRect(ctx, x + 2, y + 12, w - 4, h * 0.44, 4);
        ctx.fill();
        ctx.fillStyle = '#111827';
        for (let sx = x + 6; sx < x + w - 8; sx += 14) {
          ctx.fillRect(sx, y + 14, 7, h * 0.44 - 4);
        }
        // Blinking amber beacon
        ctx.fillStyle = Math.floor(time * 6) % 2 === 0 ? '#fde047' : '#d97706';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + 8, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'burning_barrel':
        // Ribbed Iron Fire Drum / Mashal Brazier with Multi-Layer Animated Flames
        ctx.fillStyle = '#57220d';
        roundRect(ctx, x + 2, y + 14, w - 4, h - 14, 6);
        ctx.fill();
        // Iron barrel hoops
        ctx.fillStyle = '#29150b';
        ctx.fillRect(x + 1, y + 22, w - 2, 4);
        ctx.fillRect(x + 1, y + h - 12, w - 2, 4);
        // Rim glow
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 4, y + 13, w - 8, 4);
        const flicker = Math.sin(time * 22 + x) * 4;
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 15);
        ctx.quadraticCurveTo(x + w * 0.35, y - 16 + flicker, x + w * 0.52, y - 2);
        ctx.quadraticCurveTo(x + w * 0.72, y - 18 - flicker, x + w - 5, y + 15);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(x + 11, y + 15);
        ctx.quadraticCurveTo(x + w * 0.5, y - 4 + flicker * 0.5, x + w - 11, y + 15);
        ctx.fill();
        break;

      case 'spikes':
        // Forged Steel Fort Spikes with Riveted Baseplate & 3D Pyramidal Facets
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x, y + h - 8, w, 8);
        ctx.fillStyle = '#6b7280';
        for (let r = 6; r < w - 4; r += 12) {
          ctx.fillRect(x + r, y + h - 6, 3, 3);
        }
        for (let i = 0; i < 3; i++) {
          const sw = w / 3;
          ctx.fillStyle = '#e5e7eb';
          ctx.beginPath();
          ctx.moveTo(x + i * sw, y + h - 8);
          ctx.lineTo(x + (i + 0.5) * sw, y);
          ctx.lineTo(x + (i + 0.5) * sw, y + h - 8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#4b5563';
          ctx.beginPath();
          ctx.moveTo(x + (i + 0.5) * sw, y);
          ctx.lineTo(x + (i + 1) * sw, y + h - 8);
          ctx.lineTo(x + (i + 0.5) * sw, y + h - 8);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'cactus':
        // Thar Desert Ribbed Cactus with Shaded Arms & Desert Bloom
        ctx.fillStyle = '#1b4332';
        roundRect(ctx, x + w * 0.3, y + 2, w * 0.4, h - 2, 7);
        ctx.fill();
        roundRect(ctx, x, y + h * 0.25, w * 0.35, h * 0.16, 4);
        roundRect(ctx, x + w * 0.65, y + h * 0.35, w * 0.35, h * 0.16, 4);
        ctx.fill();
        // Vertical sunlit ribs
        ctx.fillStyle = '#40916c';
        ctx.fillRect(x + w * 0.38, y + 5, 4, h - 10);
        ctx.fillStyle = '#74c69d';
        ctx.fillRect(x + w * 0.49, y + 5, 2.5, h - 10);
        // Desert flower on top
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'giant_rock':
      case 'rolling_stone':
        // Craggy Faceted Sandstone Boulder
        ctx.save();
        if (kind === 'rolling_stone') {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate(-time * 7);
          ctx.translate(-(x + w / 2), -(y + h / 2));
        }
        ctx.fillStyle = '#6c757d';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Sunlit upper facet
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(x + w * 0.42, y + h * 0.36, w * 0.28, 0, Math.PI * 2);
        ctx.fill();
        // Deep rock crevices & craters
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(x + w * 0.36, y + h * 0.44, w * 0.14, 0, Math.PI * 2);
        ctx.arc(x + w * 0.65, y + h * 0.64, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;

      case 'water_puddle':
        // Realistic Monsoon Water Puddle with Sky Reflection & Ripples
        ctx.fillStyle = 'rgba(12, 74, 110, 0.78)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h - 4, w * 0.52, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h - 4, w * 0.44, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.88)';
        ctx.lineWidth = 1.5;
        const rip = (Math.sin(time * 6) + 1) * 0.5;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h - 4, w * (0.18 + rip * 0.22), 2.5 + rip * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'fallen_tree':
        // Mossy Fallen Banyan/Teak Log with Bark Texture & Cut Wood Rings
        ctx.fillStyle = '#4a2c11';
        roundRect(ctx, x, y + 10, w - 6, h - 12, 10);
        ctx.fill();
        ctx.fillStyle = '#6b3e1b';
        ctx.fillRect(x + 8, y + 14, w - 22, 6);
        // Cut wood cross-section on left end
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + h * 0.58, 7, (h - 14) * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        // Green moss patches
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + 11, 16, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'broken_cart':
        // Broken Desi Wooden Hand Cart with Spoked Wheel
        ctx.fillStyle = '#7c2d12';
        roundRect(ctx, x + 2, y + 10, w - 8, h - 20, 4);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + 4, w - 8, 7);
        // Spoked wooden wheel
        const cxW = x + w * 0.65;
        const cyW = y + h - 12;
        ctx.strokeStyle = '#3b1c0e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cxW, cyW, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.6;
        for (let a = 0; a < 4; a++) {
          const ang = (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cxW + Math.cos(ang) * 10, cyW + Math.sin(ang) * 10);
          ctx.lineTo(cxW - Math.cos(ang) * 10, cyW - Math.sin(ang) * 10);
          ctx.stroke();
        }
        break;

      case 'laser_barrier':
        // Cyber Laser Emitter Pillar with Warning LED & Plasma Core
        ctx.fillStyle = '#1e293b';
        roundRect(ctx, x, y + h - 12, w, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + w * 0.25, y, w * 0.5, 6);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.28)';
        ctx.fillRect(x + w * 0.18, y + 4, w * 0.64, h - 14);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(x + w * 0.38, y + 4, w * 0.24, h - 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + w * 0.45, y + 4, w * 0.1, h - 14);
        break;

      case 'flying_drone':
      case 'flying_bird':
        const wingY = Math.sin(time * 18 + x) * 8;
        if (kind === 'flying_drone') {
          // Quad-Rotor Security Drone
          ctx.fillStyle = '#0f172a';
          roundRect(ctx, x + 8, y + h * 0.32, w - 16, h * 0.38, 8);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + h * 0.32);
          ctx.lineTo(x + w - 4, y + h * 0.32);
          ctx.stroke();
          // Spinning rotor discs
          ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.fillRect(x, y + h * 0.2, 18, 4);
          ctx.fillRect(x + w - 18, y + h * 0.2, 18, 4);
          // Red scanner eye
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x + w * 0.5, y + h * 0.5, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Indian Black Kite / Eagle with Layered Wings & Hooked Beak
          ctx.fillStyle = '#4a2e1f';
          ctx.beginPath();
          ctx.ellipse(x + w * 0.5, y + h * 0.55, w * 0.36, h * 0.24, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#8d5524';
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x + 8, y + h * 0.55 + wingY);
          ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.16 - wingY, x + w - 6, y + h * 0.55 + wingY);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(x + 3, y + h * 0.55);
          ctx.lineTo(x + 14, y + h * 0.45);
          ctx.lineTo(x + 14, y + h * 0.65);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'hanging_lantern':
      case 'low_banner':
      case 'swinging_chain':
        if (kind === 'swinging_chain') {
          const swing = Math.sin(time * 5 + x * 0.01) * 0.22;
          ctx.translate(x + w * 0.5, 0);
          ctx.rotate(swing);
          ctx.translate(-(x + w * 0.5), 0);
        }
        ctx.strokeStyle = kind === 'swinging_chain' ? '#64748b' : '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, 0);
        ctx.lineTo(x + w / 2, y + 6);
        ctx.stroke();
        if (kind === 'hanging_lantern') {
          ctx.fillStyle = 'rgba(255, 190, 50, 0.26)';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, w * 0.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#92400e';
          roundRect(ctx, x + 5, y + 4, w - 10, h - 6, 10);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2 + 2, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + 5, 12, Math.PI, 0);
          ctx.fill();
        } else if (kind === 'low_banner') {
          ctx.fillStyle = '#7f1d1d';
          roundRect(ctx, x, y, w, h - 4, 6);
          ctx.fill();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 3, y + 3, w - 6, h - 10);
          ctx.fillStyle = '#ff9f1c';
          for (let m = 0; m < 4; m++) {
            ctx.beginPath();
            ctx.arc(x + 9 + m * 12, y + h - 4, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Heavy Iron Spiked Pendulum Mace
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, w * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(x + w * 0.42, y + h * 0.42, w * 0.14, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'flying_arrow':
        // Feathered Royal War Arrow
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 12, y + h / 2 - 2, w - 20, 4);
        // Steel arrowhead
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + 14, y + h / 2 - 7);
        ctx.lineTo(x + 14, y + h / 2 + 7);
        ctx.closePath();
        ctx.fill();
        // Crimson fletching feathers
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(x + w, y + h / 2 - 7);
        ctx.lineTo(x + w - 12, y + h / 2 - 2);
        ctx.lineTo(x + w - 12, y + h / 2 + 2);
        ctx.lineTo(x + w, y + h / 2 + 7);
        ctx.closePath();
        ctx.fill();
        break;

      case 'boss_laser':
      case 'dark_slash':
        ctx.fillStyle = kind === 'boss_laser' ? 'rgba(0, 245, 212, 0.25)' : 'rgba(255, 0, 85, 0.25)';
        roundRect(ctx, x - 4, y + h * 0.15, w + 8, h * 0.7, 12);
        ctx.fill();
        ctx.fillStyle = kind === 'boss_laser' ? '#00f5d4' : '#ff2a6d';
        roundRect(ctx, x, y + h * 0.25, w, h * 0.5, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, x + 6, y + h * 0.38, w - 12, h * 0.24, 6);
        ctx.fill();
        break;

      case 'royal_guard':
        // Armored Palace Sentinel with Helmet, Tunic, Shield & Spear
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + w - 6, y - 6);
        ctx.lineTo(x + w - 6, y + h);
        ctx.stroke();
        ctx.fillStyle = '#9b2226';
        roundRect(ctx, x + 6, y + 16, w - 14, h - 16, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 6, y + 30, w - 14, 5);
        ctx.fillStyle = '#d99b66';
        ctx.beginPath();
        ctx.arc(x + w / 2 - 1, y + 12, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4af37';
        roundRect(ctx, x + 8, y, w - 18, 10, 5);
        ctx.fill();
        // Embossed round Dhal shield
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(x + 8, y + h * 0.58, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        break;

      case 'running_bull':
      case 'wild_boar':
        ctx.fillStyle = kind === 'running_bull' ? '#1c1410' : '#4a3228';
        roundRect(ctx, x + 4, y + 10, w - 4, h - 20, 10);
        ctx.fill();
        // Muscular shoulder hump
        ctx.beginPath();
        ctx.arc(x + 16, y + 14, 11, Math.PI, 0);
        ctx.fill();
        const legMove = Math.sin(time * 18 + x) * 5;
        ctx.fillRect(x + 10 + legMove, y + h - 12, 6, 12);
        ctx.fillRect(x + w - 16 - legMove, y + h - 12, 6, 12);
        // Curved ivory horns / tusks
        ctx.strokeStyle = '#faf4e8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 15);
        ctx.quadraticCurveTo(x - 3, y + 5, x + 6, y + 1);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x + 11, y + 19, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'rolling_barrel':
        // Iron-Hooped Oak Barrel
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(-time * 8);
        ctx.fillStyle = '#9c6644';
        ctx.beginPath();
        ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.strokeStyle = '#5c3a21';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.35, 0);
        ctx.lineTo(w * 0.35, 0);
        ctx.moveTo(0, -w * 0.35);
        ctx.lineTo(0, w * 0.35);
        ctx.stroke();
        ctx.restore();
        break;

      case 'moving_platform':
      default:
        // Ornate Carved Royal Balcony Deck
        ctx.fillStyle = '#78350f';
        roundRect(ctx, x, y, w, h, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 3, y, w - 6, 5);
        ctx.fillStyle = '#451a03';
        for (let bx = x + 12; bx < x + w - 12; bx += 22) {
          ctx.fillRect(bx, y + 8, 8, h - 11);
        }
        break;
    }

    ctx.restore();
  }

  function drawCollectible(ctx, item, time) {
    const bob = Math.sin(time * 6 + item.x * 0.05) * 3.5;
    const cx = item.x + item.w / 2;
    const cy = item.y + item.h / 2 + bob;

    if (item.kind === 'coin') {
      const spin = Math.max(0.32, Math.abs(Math.cos(time * 5 + item.x * 0.02)));
      ctx.fillStyle = 'rgba(255, 215, 0, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, item.w * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(cx, cy, (item.w / 2) * spin, item.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (spin > 0.65) {
        ctx.drawImage(getRupeeSprite(), cx - 10, cy - 10);
      }
    } else if (item.kind === 'gem') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13);
      ctx.lineTo(cx + 11, cy);
      ctx.lineTo(cx, cy + 13);
      ctx.lineTo(cx - 11, cy);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'chakram') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 8);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (item.kind === 'powerup') {
      ctx.drawImage(getPowerOrbSprite(item.powerType), cx - 22, cy - 22);
    }
  }

  function drawBoss(ctx, boss, time) {
    if (!boss) return;
    ctx.save();
    const floatY = Math.sin(time * 4) * 8;
    const bx = boss.x;
    const by = boss.y + floatY;

    ctx.fillStyle = boss.id === 'boss5' ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 60, 60, 0.2)';
    ctx.beginPath();
    ctx.arc(bx + boss.w / 2, by + boss.h / 2, boss.w * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.color;
    roundRect(ctx, bx, by + 26, boss.w, boss.h - 26, 14);
    ctx.fill();

    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(bx + 4, by + 30, boss.w - 8, boss.h - 34);

    ctx.fillStyle = boss.id === 'boss5' ? '#181822' : boss.color;
    ctx.beginPath();
    ctx.arc(bx + boss.w / 2, by + 26, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.moveTo(bx + boss.w / 2 - 14, by + 2);
    ctx.lineTo(bx + boss.w / 2 - 18, by - 14);
    ctx.lineTo(bx + boss.w / 2 - 6, by - 4);
    ctx.lineTo(bx + boss.w / 2, by - 18);
    ctx.lineTo(bx + boss.w / 2 + 6, by - 4);
    ctx.lineTo(bx + boss.w / 2 + 18, by - 14);
    ctx.lineTo(bx + boss.w / 2 + 14, by + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = boss.id === 'boss5' ? '#ffd700' : '#ff3b3b';
    ctx.beginPath();
    ctx.arc(bx + boss.w / 2 - 10, by + 22, 4.5, 0, Math.PI * 2);
    ctx.arc(bx + boss.w / 2 + 4, by + 22, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function shadeColor(hex, percent) {
    const key = `${hex}:${percent}`;
    if (shadeCache[key]) return shadeCache[key];
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    const res = `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    shadeCache[key] = res;
    return res;
  }

  return {
    drawSheru,
    drawBackground,
    drawObstacle,
    drawCollectible,
    drawBoss
  };
})();
