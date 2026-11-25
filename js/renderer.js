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
      ctx.fillStyle = '#111118';
      roundRect(ctx, exLeft - 6, headY - 8, 12, 8, 2.5);
      roundRect(ctx, exRight - 6, headY - 8, 12, 8, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(exLeft - 6, headY - 8, 12, 8);
      ctx.strokeRect(exRight - 6, headY - 8, 12, 8);
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

  // ==================== ALL 11 REALISTIC INDIAN MAPS ====================
  function drawBackground(ctx, width, height, groundY, world, scrollX, time) {
    // Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, world.skyTop);
    grad.addColorStop(1, world.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, groundY);

    // Subtle Distant Clouds / Mist
    ctx.save();
    ctx.fillStyle = world.id === 'future' ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 255, 255, 0.12)';
    const cloudSpan = width + 300;
    for (let i = 0; i < 4; i++) {
      const cx = (((i * 340 - scrollX * 0.05) % cloudSpan) + cloudSpan) % cloudSpan - 120;
      const cy = groundY * (0.14 + (i % 2) * 0.1);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 35, cy - 8, 48, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Sun / Moon with lightweight Halo (no expensive GPU shadowBlur)
    const sunX = width * 0.78;
    const sunY = groundY * 0.24;
    const sunR = Math.min(width, height) * 0.072;
    ctx.fillStyle = 'rgba(255, 230, 150, 0.16)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 1.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = world.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Far Layer (0.15x speed)
    drawParallaxLayer(ctx, width, groundY, scrollX * 0.15, world.farColor, 155, world.id, 'far', time);

    // World-Specific Mid-Ground Features
    if (world.id === 'chennai') {
      // Bay of Bengal shimmering ocean strip behind Marina Beach!
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(0, groundY - 28, width, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const waveOff = scrollX * 0.3;
      for (let wx = -(waveOff % 90); wx < width + 90; wx += 90) {
        ctx.fillRect(wx, groundY - 18, 42, 3);
      }
    } else if (world.id === 'kochi') {
      // Shimmering Kerala Backwater Canal + Kettuvallam Houseboats!
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(0, groundY - 34, width, 34);
      const boatOff = scrollX * 0.28;
      for (let bx = -(boatOff % 380); bx < width + 380; bx += 380) {
        // Wooden houseboat hull & thatched bamboo canopy
        ctx.fillStyle = '#4a2c11';
        ctx.beginPath();
        ctx.moveTo(bx + 20, groundY - 12);
        ctx.lineTo(bx + 120, groundY - 12);
        ctx.lineTo(bx + 106, groundY - 2);
        ctx.lineTo(bx + 34, groundY - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(bx + 70, groundY - 12, 26, Math.PI, 0);
        ctx.fill();
      }
    } else if (world.id === 'hyderabad') {
      // Hussain Sagar Lake reflection strip
      ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.fillRect(0, groundY - 20, width, 20);
    }

    // Mid Layer (0.42x speed)
    if (world.id === 'city') {
      drawIndianBazaarLayer(ctx, width, groundY, scrollX * 0.45, time);
    } else {
      drawParallaxLayer(ctx, width, groundY, scrollX * 0.42, world.midColor, 108, world.id, 'mid', time);
    }

    // Ground & Road Design per World
    ctx.fillStyle = world.groundBody;
    ctx.fillRect(0, groundY, width, height - groundY);

    if (world.id === 'city' || world.id === 'bengaluru') {
      // Indian Sidewalk Curb + Asphalt Road with White Dashed Markings
      ctx.fillStyle = world.id === 'city' ? '#b85d4b' : '#64748b';
      ctx.fillRect(0, groundY - 10, width, 12);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, groundY + 2, width, height - groundY);

      ctx.fillStyle = '#f8f9fa';
      const dashGap = 64;
      const dashOffset = scrollX % dashGap;
      for (let gx = -dashOffset; gx < width + dashGap; gx += dashGap) {
        ctx.fillRect(gx, groundY + 38, 34, 6);
      }
    } else {
      ctx.fillStyle = world.groundTop;
      ctx.fillRect(0, groundY, width, 15);
      // Perspective ground texture
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      const tileW = 68;
      const offset = scrollX % tileW;
      for (let gx = -offset; gx < width + tileW; gx += tileW) {
        ctx.fillRect(gx, groundY + 15, 28, 6);
        ctx.fillRect(gx + 34, groundY + 32, 20, 5);
      }
    }

    if (world.id === 'future') {
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(width, groundY + 2);
      ctx.stroke();
    }
  }

  const SHOP_SIGNS = ['LAXMI TEA', 'KUKI MASALE', 'GUPTA SWEETS', 'DESI JUTIS', 'RAJA SAREES'];
  const SHOP_COLORS = ['#d97b66', '#e59882', '#c8644f', '#e08e79', '#d4745e'];

  function drawIndianBazaarLayer(ctx, width, groundY, offset, time) {
    ctx.save();
    const segW = 195;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const color = SHOP_COLORS[Math.abs(idx) % SHOP_COLORS.length];
      const sign = SHOP_SIGNS[Math.abs(idx) % SHOP_SIGNS.length];
      const bldgH = 178 + (Math.abs(idx * 37) % 3) * 22;

      ctx.fillStyle = color;
      ctx.fillRect(x + 2, groundY - bldgH, segW - 4, bldgH - 10);

      // Overhead wires
      ctx.strokeStyle = 'rgba(40, 25, 20, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, groundY - bldgH + 14);
      ctx.quadraticCurveTo(x + segW * 0.5, groundY - bldgH + 28, x + segW, groundY - bldgH + 14);
      ctx.stroke();

      // Upper Jharokha Arches
      ctx.fillStyle = '#5c261d';
      for (let a = 0; a < 3; a++) {
        const ax = x + 22 + a * 54;
        const ay = groundY - bldgH + 34;
        ctx.beginPath();
        ctx.arc(ax + 14, ay, 14, Math.PI, 0);
        ctx.lineTo(ax + 28, ay + 24);
        ctx.lineTo(ax, ay + 24);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#fae1d8';
      ctx.fillRect(x + 2, groundY - bldgH, segW - 4, 6);

      // Shop Signboard
      ctx.fillStyle = '#fff8ef';
      ctx.fillRect(x + 14, groundY - 94, segW - 28, 22);
      ctx.strokeStyle = '#8b2e20';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 14, groundY - 94, segW - 28, 22);

      ctx.fillStyle = '#7a1c14';
      ctx.font = 'bold 11px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sign, x + segW * 0.5, groundY - 79);

      // Shop Interior + Marigold Toran
      ctx.fillStyle = '#3b1c14';
      ctx.fillRect(x + 18, groundY - 68, segW - 36, 58);

      ctx.fillStyle = '#ff9f1c';
      for (let g = 0; g < 7; g++) {
        ctx.beginPath();
        ctx.arc(x + 28 + g * 22, groundY - 64 + Math.sin(g) * 3, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (Math.abs(idx) % 2 === 0) {
        ctx.fillStyle = '#1f242b';
        ctx.fillRect(x + 6, groundY - 104, 5, 94);
        ctx.fillStyle = 'rgba(255, 225, 110, 0.9)';
        ctx.beginPath();
        ctx.arc(x + 8.5, groundY - 108, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawParallaxLayer(ctx, width, groundY, offset, color, maxH, worldId, layer, time) {
    ctx.save();
    ctx.fillStyle = color;
    const segW = layer === 'far' ? 190 : 150;
    const startIdx = Math.floor(offset / segW) - 1;
    const count = Math.ceil(width / segW) + 3;

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const x = idx * segW - offset;
      const seed = Math.abs(Math.sin(idx * 12.9898) * 43758.5453) % 1;
      const h = maxH * (0.48 + seed * 0.52);

      if (worldId === 'palace' || worldId === 'fortress') {
        // Palace / Fortress Chhatris, Arches & Mashal Fire
        ctx.fillRect(x + 8, groundY - h * 0.72, segW - 16, h * 0.72);
        ctx.beginPath();
        ctx.arc(x + segW * 0.5, groundY - h * 0.72, (segW - 36) * 0.34, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + segW * 0.5 - 3, groundY - h - 10, 6, 16);
        if (layer === 'mid') {
          ctx.fillStyle = worldId === 'fortress' ? '#ff6b00' : 'rgba(255, 215, 0, 0.28)';
          ctx.beginPath();
          ctx.arc(x + segW * 0.5, groundY - h * 0.35, worldId === 'fortress' ? 5 : 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = color;
        }
      } else if (worldId === 'chennai') {
        // Colorful Stepped Dravidian Gopuram Temple Towers
        const tiers = 4;
        const baseW = segW * 0.56;
        for (let t = 0; t < tiers; t++) {
          const tw = baseW * (1 - t * 0.18);
          const th = (h * 0.85) / tiers;
          ctx.fillStyle = layer === 'mid' && t % 2 === 1 ? '#e76f51' : color;
          ctx.fillRect(x + (segW - tw) * 0.5, groundY - (t + 1) * th - 18, tw, th + 1);
        }
        ctx.fillStyle = color;
      } else if (worldId === 'hyderabad') {
        // Iconic 4-Minaret Charminar & Arches
        ctx.fillRect(x + 22, groundY - h * 0.55 - 10, segW - 44, h * 0.55);
        ctx.fillRect(x + 20, groundY - h * 0.94 - 10, 12, h * 0.94);
        ctx.fillRect(x + segW - 32, groundY - h * 0.94 - 10, 12, h * 0.94);
        ctx.beginPath();
        ctx.arc(x + 26, groundY - h * 0.94 - 10, 8, Math.PI, 0);
        ctx.arc(x + segW - 26, groundY - h * 0.94 - 10, 8, Math.PI, 0);
        ctx.fill();
        if (layer === 'mid') {
          ctx.fillStyle = 'rgba(255, 229, 180, 0.28)';
          ctx.beginPath();
          ctx.arc(x + segW * 0.5, groundY - 22, 16, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = color;
        }
      } else if (worldId === 'coimbatore') {
        // Layered Western Ghats & Terraced Nilgiri Tea Hills
        ctx.beginPath();
        ctx.moveTo(x - 28, groundY);
        ctx.quadraticCurveTo(x + segW * 0.5, groundY - h * 1.15, x + segW + 28, groundY);
        ctx.fill();
        if (layer === 'mid') {
          ctx.strokeStyle = 'rgba(183, 228, 199, 0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 12, groundY - h * 0.35);
          ctx.quadraticCurveTo(x + segW * 0.5, groundY - h * 0.55, x + segW - 12, groundY - h * 0.35);
          ctx.stroke();
        }
      } else if (worldId === 'bengaluru') {
        // Vidhana Soudha Pillared Facade + Flowering Trees
        ctx.fillRect(x + 10, groundY - h * 0.72, segW - 20, h * 0.72);
        ctx.beginPath();
        ctx.arc(x + segW * 0.5, groundY - h * 0.72, 20, Math.PI, 0);
        ctx.fill();
        if (layer === 'mid') {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(x + 20, groundY - 38, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = color;
        }
      } else if (worldId === 'kochi') {
        // Leaning Coconut Palms & Backwater Silhouettes
        ctx.fillRect(x + segW * 0.48, groundY - h * 0.82 - 20, 7, h * 0.82);
        for (let f = -2; f <= 2; f++) {
          ctx.beginPath();
          ctx.ellipse(x + segW * 0.5 + f * 13, groundY - h * 0.82 - 20, 20, 5.5, f * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (worldId === 'desert') {
        // Layered Sand Dunes
        ctx.beginPath();
        ctx.moveTo(x - 24, groundY);
        ctx.quadraticCurveTo(x + segW * 0.5, groundY - h, x + segW + 24, groundY);
        ctx.fill();
      } else if (worldId === 'jungle') {
        // Dense Rainforest Canopy & Hanging Vines
        ctx.fillRect(x + segW * 0.44, groundY - h * 0.65, 14, h * 0.65);
        ctx.beginPath();
        ctx.arc(x + segW * 0.5, groundY - h * 0.7, 42, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Neo-Bharat Cyber Lotus Towers
        ctx.fillRect(x + 8, groundY - h, segW - 16, h);
        if (worldId === 'future' && layer === 'mid') {
          ctx.fillStyle = 'rgba(0, 245, 212, 0.38)';
          ctx.fillRect(x + 18, groundY - h + 14, segW - 36, 4);
          ctx.fillRect(x + 18, groundY - h + 30, segW - 36, 3);
          ctx.fillStyle = color;
        }
      }
    }
    ctx.restore();
  }

  // ==================== REALISTIC INDIAN OBSTACLES ====================
  function drawObstacle(ctx, obs, time) {
    const { x, y, w, h, kind } = obs;
    ctx.save();

    // Soft ground shadow under ground obstacles
    if (!obs.isAir && kind !== 'water_puddle') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h + 2, w * 0.48, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    switch (kind) {
      case 'moving_vehicle':
        // Iconic Yellow & Black Indian Auto-Rickshaw
        ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.58);
        ctx.lineTo(x - 40, y + h * 0.4);
        ctx.lineTo(x - 40, y + h * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#18181b';
        roundRect(ctx, x + 8, y, w - 12, h * 0.6, 10);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(x + 22, y + 16, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 17, y + 22, 10, 12);
        ctx.fillStyle = '#facc15';
        roundRect(ctx, x, y + h * 0.42, w, h * 0.44, 8);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 2, y + h * 0.62, w - 4, 5);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 6, y + 8, 10, 18);
        ctx.fillStyle = '#111';
        [x + 13, x + w - 13].forEach(wx => {
          ctx.beginPath();
          ctx.arc(wx, y + h - 5, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d4d4d8';
          ctx.beginPath();
          ctx.arc(wx, y + h - 5, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#111';
        });
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + 2, y + h * 0.58, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'wooden_box':
        ctx.fillStyle = '#8d5524';
        roundRect(ctx, x, y, w, h, 4);
        ctx.fill();
        ctx.strokeStyle = '#4a2c11';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + w - 4, y + h - 4);
        ctx.moveTo(x + w - 4, y + 4);
        ctx.lineTo(x + 4, y + h - 4);
        ctx.stroke();
        break;

      case 'palace_barrier':
      case 'traffic_barricade':
        ctx.fillStyle = kind === 'palace_barrier' ? '#9b2226' : '#f59e0b';
        roundRect(ctx, x, y, w, h, 5);
        ctx.fill();
        ctx.fillStyle = kind === 'palace_barrier' ? '#ffd700' : '#111827';
        for (let sx = x + 6; sx < x + w - 6; sx += 16) {
          ctx.fillRect(sx, y + 5, 8, h - 10);
        }
        break;

      case 'burning_barrel':
        ctx.fillStyle = '#7c2d12';
        roundRect(ctx, x, y + 12, w, h - 12, 6);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 2, y + 22, w - 4, 4);
        const flicker = Math.sin(time * 22 + x) * 4;
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 14);
        ctx.quadraticCurveTo(x + w * 0.5, y - 16 + flicker, x + w - 4, y + 14);
        ctx.fill();
        ctx.fillStyle = '#ffd966';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + 10, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'spikes':
        ctx.fillStyle = '#374151';
        ctx.fillRect(x, y + h - 7, w, 7);
        for (let i = 0; i < 3; i++) {
          const sw = w / 3;
          ctx.fillStyle = '#d1d5db';
          ctx.beginPath();
          ctx.moveTo(x + i * sw, y + h - 7);
          ctx.lineTo(x + (i + 0.5) * sw, y);
          ctx.lineTo(x + (i + 1) * sw, y + h - 7);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#6b7280';
          ctx.beginPath();
          ctx.moveTo(x + (i + 0.5) * sw, y);
          ctx.lineTo(x + (i + 1) * sw, y + h - 7);
          ctx.lineTo(x + (i + 0.5) * sw, y + h - 7);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'cactus':
        ctx.fillStyle = '#2d6a4f';
        roundRect(ctx, x + w * 0.3, y, w * 0.4, h, 6);
        ctx.fill();
        roundRect(ctx, x, y + h * 0.25, w * 0.35, h * 0.16, 4);
        roundRect(ctx, x + w * 0.65, y + h * 0.35, w * 0.35, h * 0.16, 4);
        ctx.fill();
        ctx.fillStyle = '#52b788';
        ctx.fillRect(x + w * 0.44, y + 4, 3, h - 8);
        break;

      case 'giant_rock':
      case 'rolling_stone':
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
        ctx.fillStyle = '#495057';
        ctx.beginPath();
        ctx.arc(x + w * 0.38, y + h * 0.4, w * 0.16, 0, Math.PI * 2);
        ctx.arc(x + w * 0.64, y + h * 0.62, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;

      case 'water_puddle':
        // Realistic rippling water hazard + warning cone
        ctx.fillStyle = 'rgba(14, 165, 233, 0.82)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h - 4, w * 0.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.lineWidth = 1.5;
        const rip = (Math.sin(time * 6) + 1) * 0.5;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h - 4, w * (0.2 + rip * 0.2), 3 + rip * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'fallen_tree':
      case 'broken_cart':
        ctx.fillStyle = '#9c4221';
        roundRect(ctx, x, y + 10, w, h - 18, 5);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x, y + 4, w, 8);
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(x + 14, y + h - 6, 7, 0, Math.PI * 2);
        ctx.arc(x + w - 14, y + h - 6, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'laser_barrier':
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x, y + h - 10, w, 10);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.28)';
        ctx.fillRect(x + w * 0.2, y, w * 0.6, h - 8);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(x + w * 0.35, y, w * 0.3, h - 8);
        break;

      case 'flying_drone':
      case 'flying_bird':
        const wingY = Math.sin(time * 18 + x) * 8;
        if (kind === 'flying_drone') {
          ctx.fillStyle = '#0f172a';
          roundRect(ctx, x + 8, y + h * 0.3, w - 16, h * 0.4, 8);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 2, y + h * 0.25, 16, 4);
          ctx.fillRect(x + w - 18, y + h * 0.25, 16, 4);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x + w * 0.5, y + h * 0.5, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#5c4033';
          ctx.beginPath();
          ctx.ellipse(x + w * 0.5, y + h * 0.55, w * 0.36, h * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f4a261';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + h * 0.55 + wingY);
          ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.2 - wingY, x + w - 6, y + h * 0.55 + wingY);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(x + 4, y + h * 0.55);
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
        ctx.strokeStyle = '#d4af37';
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
          ctx.fillStyle = '#b45309';
          roundRect(ctx, x + 4, y, w - 8, h, 10);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, 10, 0, Math.PI * 2);
          ctx.fill();
        } else if (kind === 'low_banner') {
          ctx.fillStyle = '#9b2226';
          roundRect(ctx, x, y, w, h, 6);
          ctx.fill();
          ctx.fillStyle = '#ff9f1c';
          for (let m = 0; m < 4; m++) {
            ctx.beginPath();
            ctx.arc(x + 9 + m * 12, y + h - 6, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = '#4b5563';
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, w * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'flying_arrow':
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(x + 8, y + h / 2 - 2, w - 8, 4);
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + 12, y);
        ctx.lineTo(x + 12, y + h);
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
        ctx.fillStyle = '#9b2226';
        roundRect(ctx, x + 6, y + 16, w - 12, h - 16, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 6, y + 30, w - 12, 5);
        ctx.fillStyle = '#d99b66';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 12, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        roundRect(ctx, x + 8, y, w - 16, 11, 5);
        ctx.fill();
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(x + 8, y + h * 0.58, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'running_bull':
      case 'wild_boar':
        ctx.fillStyle = kind === 'running_bull' ? '#1f1612' : '#5c4033';
        roundRect(ctx, x + 4, y + 12, w - 4, h - 22, 10);
        ctx.fill();
        // Animated galloping hooves
        const legMove = Math.sin(time * 18 + x) * 5;
        ctx.fillRect(x + 10 + legMove, y + h - 12, 6, 12);
        ctx.fillRect(x + w - 16 - legMove, y + h - 12, 6, 12);
        ctx.strokeStyle = '#faf4e8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 16);
        ctx.quadraticCurveTo(x - 2, y + 6, x + 6, y + 2);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x + 11, y + 20, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'rolling_barrel':
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(-time * 8);
        ctx.fillStyle = '#9c6644';
        ctx.beginPath();
        ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4a2c11';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        break;

      case 'moving_platform':
      default:
        // Rideable Royal Platform Deck
        ctx.fillStyle = '#78350f';
        roundRect(ctx, x, y, w, h, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 4, y, w - 8, 5);
        break;
    }

    ctx.restore();
  }

  function drawCollectible(ctx, item, time) {
    ctx.save();
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
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', cx, cy + 1);
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
    } else if (item.kind === 'powerup') {
      const p = window.GAME_DATA.POWERUPS[item.powerType];
      ctx.fillStyle = 'rgba(18, 14, 34, 0.88)';
      ctx.strokeStyle = p ? p.color : '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(p ? p.icon : '⚡', cx, cy + 1);
    }

    ctx.restore();
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
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  return {
    drawSheru,
    drawBackground,
    drawObstacle,
    drawCollectible,
    drawBoss
  };
})();
