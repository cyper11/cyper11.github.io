/* Place projected labels near their landmarks, reserving space for map controls. */
(function (host, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else host.CareerCityLayout = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  return function placeLabels(points, width, height) {
    const result = new Array(points.length), occupied = [];
    const order = points.map((p, i) => i).sort((a, b) => Number(!!points[b].priority) - Number(!!points[a].priority));
    for (const i of order) {
      const p = points[i];
      const clamp = (x, y) => ({
        x: Math.max(12 + p.width / 2, Math.min(width - 12 - p.width / 2, x)),
        y: Math.max(64 + p.height, Math.min(height - 64, y))
      });
      const rect = pos => ({ left: pos.x - p.width / 2, right: pos.x + p.width / 2, top: pos.y - p.height, bottom: pos.y });
      const fits = pos => {
        const r = rect(pos);
        return occupied.every(o => !(r.left < o.right + 6 && r.right + 6 > o.left && r.top < o.bottom + 6 && r.bottom + 6 > o.top));
      };
      const anchor = clamp(p.x, p.y);
      let chosen = anchor;
      if (!fits(anchor)) {
        const candidates = [];
        for (let row = -4; row <= 4; row++) {
          for (let col = -4; col <= 4; col++) {
            const pos = clamp(anchor.x + col * (p.width + 8), anchor.y + row * (p.height + 8));
            candidates.push({ pos, cost: (pos.x - anchor.x) ** 2 + (pos.y - anchor.y) ** 2 });
          }
        }
        candidates.sort((a, b) => a.cost - b.cost);
        chosen = candidates.find(c => fits(c.pos))?.pos || anchor;
      }
      result[i] = chosen;
      occupied.push(rect(chosen));
    }
    return result;
  };
});
