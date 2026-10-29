'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { getPetSvg, getAccessoriesSvg } = require('../src/pets');

test('Issue #27: getPetSvg applies species-specific eye-blink transform-origins', () => {
  const alienSvg = getPetSvg('alien');
  assert.ok(alienSvg.includes('class="eye-l" style="transform-origin: 57px 55px"'), 'alien left eye origin');
  assert.ok(alienSvg.includes('class="eye-r" style="transform-origin: 83px 55px"'), 'alien right eye origin');

  const catSvg = getPetSvg('cat');
  assert.ok(catSvg.includes('class="eye-l" style="transform-origin: 58px 60px"'), 'cat left eye origin');
  assert.ok(catSvg.includes('class="eye-r" style="transform-origin: 82px 60px"'), 'cat right eye origin');

  const robotSvg = getPetSvg('robot');
  assert.ok(robotSvg.includes('class="eye-l" style="transform-origin: 58px 48px"'), 'robot left eye origin');
  assert.ok(robotSvg.includes('class="eye-r" style="transform-origin: 82px 48px"'), 'robot right eye origin');
});

test('Issue #27: getAccessoriesSvg adapts coordinates based on pet species', () => {
  // Level 5: Sunglasses
  const robotSunglasses = getAccessoriesSvg(5, 'robot');
  assert.ok(robotSunglasses.includes('transform="translate(0, -10)"'), 'robot sunglasses shifted up to eye level');

  const catSunglasses = getAccessoriesSvg(5, 'cat');
  assert.ok(catSunglasses.includes('transform="translate(0, 3)"'), 'cat sunglasses positioned to cat eye level');

  const defaultSunglasses = getAccessoriesSvg(5);
  assert.ok(defaultSunglasses.includes('acc-sunglasses'), 'default sunglasses rendered');
  assert.equal(defaultSunglasses.includes('transform='), false, 'default alien sunglasses do not need translate transform');

  // Level 10: Top Hat
  const catTopHat = getAccessoriesSvg(10, 'cat');
  assert.ok(catTopHat.includes('rect x="50" y="36" width="40"'), 'cat top hat sits between ears');

  const robotTopHat = getAccessoriesSvg(10, 'robot');
  assert.ok(robotTopHat.includes('transform="translate(0, -5)"'), 'robot top hat positioned on head');

  // Level 15: Party Hat
  const catPartyHat = getAccessoriesSvg(15, 'cat');
  assert.ok(catPartyHat.includes('points="70,12 54,38 86,38"'), 'cat party hat base fitted between ears');

  // Level 20: Crown
  const catCrown = getAccessoriesSvg(20, 'cat');
  assert.ok(catCrown.includes('M 52 38 L 55 18'), 'cat crown fits between ears');

  const robotCrown = getAccessoriesSvg(20, 'robot');
  assert.ok(robotCrown.includes('transform="translate(0, -8)"'), 'robot crown shifted for head antenna');
});
