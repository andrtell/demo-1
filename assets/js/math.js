const X = 0;
const Y = 1;
const Z = 2;

class V3 {
  static create(x, y, z) {
    return [x, y, z];
  }

  static clone(v) {
    return [v[X], v[Y], v[Z]];
  }

  static muls(v, s) {
    return [v[X] * s, v[Y] * s, v[Z] * s];
  }

  static divs(v, s) {
    return V3.muls(v, 1 / s);
  }

  static neg(v) {
    return V3.muls(v, -1);
  }

  static add(...vs) {
    const v = V3.clone(vs[0]);
    for (let i = 0; i < vs.length; i++) {
      v[X] += vs[i][X];
      v[Y] += vs[i][Y];
      v[Z] += vs[i][Z];
    }
    return v;
  }

  static sub(...vs) {
    const v = V3.clone(vs[0]);
    for (let i = 1; i < vs.length; i++) {
      v[X] -= vs[i][X];
      v[Y] -= vs[i][Y];
      v[Z] -= vs[i][Z];
    }
    return v;
  }

  static mag(v) {
    return Math.sqrt(v[X] * v[X] + v[Y] * v[Y] + v[Z] * v[Z]);
  }

  static norm(v) {
    return V3.divs(v, V3.mag(v));
  }

  /* dot(a, b) = mag(a) * mag(b) * cos(theta) */
  static dot(a, b) {
    return a[X] * b[X] + a[Y] * b[Y] + a[Z] * b[Z];
  }

  static cross(a, b) {
    return [
      a[Y] * b[Z] - a[Z] * b[Y],
      a[Z] * b[X] - a[X] * b[Z],
      a[X] * b[Y] - a[Y] * b[X],
    ];
  }
}

const COL0 = 0;
const COL1 = 1;
const COL2 = 2;

class M3 {
  /* Components are given in row-major form */
  static create(n00, n01, n02, n10, n11, n12, n20, n21, n22) {
    /* Components are stored in column-major form */
    return [
      V3.create(n00, n10, n20),
      V3.create(n01, n11, n21),
      V3.create(n02, n12, n22),
    ];
  }

  static clone(m) {
    return [V3.clone(m[0]), V3.clone(m[1]), V3.clone(m[2])];
  }

  static muls(m, s) {
    m.map((v) => V3.muls(v, s));
  }

  static mulv(m, v) {
    return V3.add(
      V3.muls(m[COL0], v[X]),
      V3.muls(m[COL1], v[Y]),
      V3.muls(m[COL2], v[Z]),
    );
  }

  static mulm(a, b) {
    return [M3.mulv(a, b[COL0]), M3.mulv(a, b[COL1]), M3.mulv(a, b[COL2])];
  }

  static divs(m, s) {
    return M3.muls(m, 1 / s);
  }

  static neg(m) {
    return M3.muls(m, -1);
  }

  static add(...ms) {
    const m = M3.clone(ms[0]);
    for (let i = 1; i < ms.length; i++) {
      m[COL0] = V3.add(m[COL0], ms[i][COL0]);
      m[COL1] = V3.add(m[COL1], ms[i][COL1]);
      m[COL2] = V3.add(m[COL2], ms[i][COL2]);
    }
    return m;
  }

  static sub(...ms) {
    const m = M3.clone(ms[0]);
    for (let i = 1; i < ms.length; i++) {
      m[COL0] = V3.sub(m[COL0], ms[i][COL0]);
      m[COL1] = V3.sub(m[COL1], ms[i][COL1]);
      m[COL2] = V3.sub(m[COL2], ms[i][COL2]);
    }
    return m;
  }
}

m1 = M3.create(2, 1, 3, 3, 4, 1, 5, 2, 3);
m2 = M3.create(1, 2, 0, 4, 1, 2, 3, 2, 1);
v1 = V3.create(1, 2, 3);
v2 = V3.create(2, 3, 4);
