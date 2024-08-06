const X = 0;
const Y = 1;
const Z = 2;

const UX = [1, 0, 0];
const UY = [0, 1, 0];
const UZ = [0, 0, 1];

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
    for (let i = 1; i < vs.length; i++) {
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
    return V3.create(
      a[Y] * b[Z] - a[Z] * b[Y],
      a[Z] * b[X] - a[X] * b[Z],
      a[X] * b[Y] - a[Y] * b[X],
    );
  }

  static project(a, b) {
    return V3.muls(b, V3.dot(a, b) / V3.dot(b, b));
  }

  static reject(a, b) {
    return V3.sub(a, V3.project(a, b));
  }

  static round(v) {
    return V3.create(Math.round(v[X]), Math.round(v[Y]), Math.round(v[Z]));
  }

  static eq(a, b) {
    return a[X] == b[X] && a[Y] == b[Y] && a[Z] == b[Z];
  }
}

const C0 = 0;
const C1 = 1;
const C2 = 2;

const R0 = 0;
const R1 = 1;
const R2 = 2;

const MID = [UX, UY, UZ];

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
    return [V3.muls(m[C0], s), V3.muls(m[C1], s), V3.muls(m[C2], s)];
  }

  static mulv(m, v) {
    return V3.add(
      V3.muls(m[C0], v[X]),
      V3.muls(m[C1], v[Y]),
      V3.muls(m[C2], v[Z]),
    );
  }

  static mulm(a, b) {
    return [M3.mulv(a, b[C0]), M3.mulv(a, b[C1]), M3.mulv(a, b[C2])];
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
      m[C0] = V3.add(m[C0], ms[i][C0]);
      m[C1] = V3.add(m[C1], ms[i][C1]);
      m[C2] = V3.add(m[C2], ms[i][C2]);
    }
    return m;
  }

  static sub(...ms) {
    const m = M3.clone(ms[0]);
    for (let i = 1; i < ms.length; i++) {
      m[C0] = V3.sub(m[C0], ms[i][C0]);
      m[C1] = V3.sub(m[C1], ms[i][C1]);
      m[C2] = V3.sub(m[C2], ms[i][C2]);
    }
    return m;
  }

  static det(m) {
    return (
      m[C0][R0] * (m[C1][R1] * m[C2][R2] - m[C2][R1] * m[C1][R2]) +
      m[C1][R0] * (m[C2][R1] * m[C0][R2] - m[C0][R1] * m[C2][R2]) +
      m[C2][R0] * (m[C0][R1] * m[C1][R2] - m[C1][R1] * m[C0][R2])
    );
  }

  static inv(m) {
    const r0 = V3.cross(m[C1], m[C2]);
    const r1 = V3.cross(m[C2], m[C0]);
    const r2 = V3.cross(m[C0], m[C1]);

    const dot = V3.dot(r2, m[C2]);

    if (dot == 0) {
      throw Error("Can not invert non-invertible matrix");
    }

    const invDet = 1.0 / dot;

    return M3.muls(
      M3.create(r0[X], r0[Y], r0[Z], r1[X], r1[Y], r1[Z], r2[X], r2[Y], r2[Z]),
      invDet,
    );
  }

  static round(m) {
    return [V3.round(m[C0]), V3.round(m[C1]), V3.round(m[C2])];
  }

  static eq(a, b) {
    return V3.eq(a[C0], b[C0]) && V3.eq(a[C1], b[C1]) && V3.eq(a[C2], b[C2]);
  }
}

m1 = M3.create(1, 2, 10, 4, 5, 6, 7, 8, 9);
console.log(M3.round(M3.mulm(m1, M3.inv(m1))));
