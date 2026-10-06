const test = require('node:test');
const assert = require('node:assert/strict');
const place = require('../career-city-layout.js');

function bounds(p, size) {
  return { left: p.x - size.width / 2, right: p.x + size.width / 2, top: p.y - size.height, bottom: p.y };
}
function overlaps(a, b) {
  return a.left < b.right + 6 && a.right + 6 > b.left && a.top < b.bottom + 6 && a.bottom + 6 > b.top;
}

test('crowded building labels stay separate and inside a phone map', () => {
  const points = [
    { x: 165, y: 130, width: 140, height: 44, priority: true },
    { x: 170, y: 132, width: 44, height: 44 },
    { x: 162, y: 135, width: 44, height: 44 },
    { x: 164, y: 128, width: 44, height: 44 }
  ];
  const boxes = place(points, 333, 350).map((p, i) => bounds(p, points[i]));
  for (let i = 0; i < boxes.length; i++) {
    assert.ok(boxes[i].left >= 12 && boxes[i].right <= 321);
    assert.ok(boxes[i].top >= 64 && boxes[i].bottom <= 286);
    for (let j = i + 1; j < boxes.length; j++) assert.equal(overlaps(boxes[i], boxes[j]), false);
  }
});

test('the selected label keeps its anchor while lower priority labels move', () => {
  const input = [
    { x: 300, y: 200, width: 120, height: 44 },
    { x: 300, y: 200, width: 150, height: 44, priority: true }
  ];
  const positions = place(input, 700, 480);
  assert.deepEqual(positions[1], { x: 300, y: 200 });
  assert.notDeepEqual(positions[0], positions[1]);
  assert.equal(input[0].x, 300);
});

test('offscreen projected anchors are clamped away from the HUD and controls', () => {
  const input = [
    { x: -100, y: -20, width: 100, height: 44 },
    { x: 1000, y: 700, width: 44, height: 44 }
  ];
  assert.deepEqual(place(input, 390, 350), [{ x: 62, y: 108 }, { x: 356, y: 286 }]);
});
