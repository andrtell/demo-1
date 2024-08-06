const interpolate = (a, b, mu) => {
  const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
  const ret = a * (1 - mu2) + b * mu2;
  return ret;
};

create_r = (freq) => {
  const slots = [];

  let min = 1.0;
  let max = 0;

  for (let i = 0; i < freq; i++) {
    v = Math.random();
    min = Math.min(min, v);
    max = Math.max(max, v);
    slots[i] = v;
  }

  const range = max - min;

  for (let i = 0; i < freq; i++) {
    slots[i] = (slots[i] - min) / range;
  }

  return (x) => {
    x = x * freq;
    const x_ = Math.floor(x);
    const mu = x - x_;
    const i0 = x_ % freq;
    const i1 = (x_ + 1) % freq;
    return interpolate(slots[i0], slots[i1], mu);
  };
};

create_n = (freq = 1, amp = 1) => {
  octaves = [
    create_r(freq),
    create_r(freq * 2),
    create_r(freq * 4),
    create_r(freq * 8),
  ];

  return (x) => {
    let value = 0;
    for (let i = 0; i < octaves.length; i++) {
      value += (octaves[i](x) * amp) / ((i + 1) * 2);
    }
    return value;
  };
};

const can = document.getElementById("canvas");
const bcr = can.getBoundingClientRect();
can.height = bcr.height;
can.width = bcr.width;
const ctx = can.getContext("2d");
const dat = ctx.createImageData(bcr.width, bcr.height);

// const x = create_n(10, can.width);
const y = create_n(4, can.height);

const NO_PIX = can.width;
const pix = [];

for (i = 0; i < NO_PIX; i++) {
  pix[i] = [i, Math.floor(y((1 / NO_PIX) * i))];
}

for (i = 0; i < NO_PIX; i++) {
  let idx = (pix[i][0] + pix[i][1] * dat.width) * 4;
  dat.data[idx + 0] = 180;
  dat.data[idx + 1] = 180;
  dat.data[idx + 2] = 180;
  dat.data[idx + 3] = 255;
}
//
ctx.putImageData(dat, 0, 0);
