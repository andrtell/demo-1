class V3 {
  static ux = [1, 0, 0];
  static uy = [0, 1, 0];
  static uz = [0, 0, 1];

  static create(x, y, z) {
    return [x, y, z];
  }

  static x(v) {
    return v[0];
  }

  static y(v) {
    return v[1];
  }

  static z(v) {
    return v[2];
  }

  static clone(v) {
    const { create, x, y, z } = V3;
    return create(x(v), y(v), z(v));
  }

  static equal(a, b) {
    const { x, y, z } = V3;
    return x(a) == x(b) && y(a) == y(b) && z(a) == z(b);
  }

  static multiply_scalar(v, s) {
    const { create, x, y, z } = V3;
    return create(x(v) * s, y(v) * s, z(v) * s);
  }

  static divide_scalar(v, s) {
    return V3.multiply_scalar(v, 1 / s);
  }

  static negate(v) {
    return V3.multiply_scalar(v, -1);
  }

  static add(v1, v2) {
    const { x, y, z, create } = V3;
    return create(x(v1) + x(v2), y(v1) + y(v2), z(v1) + z(v2));
  }

  static subtract(v1, v2) {
    const { x, y, z, create } = V3;
    return create(x(v1) - x(v2), y(v1) - y(v2), z(v1) - z(v2));
  }

  static magnitude(v) {
    const { x, y, z } = V3;
    return Math.sqrt(x(v) * x(v) + y(v) * y(v) + z(v) * z(v));
  }

  static normalize(v) {
    const { divide_scalar, magnitude } = V3;
    return divide_scalar(v, magnitude(v));
  }

  static dot_product(a, b) {
    const { x, y, z } = V3;
    return x(a) * x(b) + y(a) * y(b) + z(a) * z(b);
  }

  static cross_product(a, b) {
    const { create, x, y, z } = V3;
    return create(
      y(a) * z(b) - z(a) * y(b),
      z(a) * x(b) - x(a) * z(b),
      x(a) * y(b) - y(a) * x(b),
    );
  }

  static project(a, b) {
    const { multiply_scalar, dot_product } = V3;
    return multiply_scalar(b, dot_product(a, b) / dot_product(b, b));
  }

  static reject(a, b) {
    const { subtract, project } = V3;
    return subtract(a, project(a, b));
  }

  static round(v) {
    const { create, x, y, z } = V3;
    return create(Math.round(x(v)), Math.round(y(v)), Math.round(z(v)));
  }
}
class M3 {
  static id = [V3.ux, V3.uy, V3.uz];

  /* Components are given as 3 row vectors (row-major) */
  static create(a, b, c) {
    /* Components are stored as 3 column vectors  (column-major) */
    const { x, y, z } = V3;
    return [
      V3.create(x(a), x(b), x(c)),
      V3.create(y(a), y(b), y(c)),
      V3.create(z(a), z(b), z(c)),
    ];
  }

  static a(m) {
    return m[0];
  }

  static b(m) {
    return m[1];
  }

  static c(m) {
    return m[2];
  }

  static equal(m1, m2) {
    const { a, b, c } = M3;
    return (
      V3.equal(a(m1), a(m2)) && V3.equal(b(m1), b(m2)) && V3.equal(c(m1), c(m2))
    );
  }

  static clone(m) {
    const { a, b, c, create } = M3;
    return create(V3.clone(a(m)), V3.clone(b(m)), V3.clone(c(m)));
  }

  static multiply_scalar(m, s) {
    const { a, b, c, create } = M3;
    return create(
      V3.multiply_scalar(a(m), s),
      V3.multiply_scalar(b(m), s),
      V3.multiply_scalar(c(m), s),
    );
  }

  static divide_scalar(m, s) {
    return M3.multiply_scalar(m, 1 / s);
  }

  static multiply_vector(m, v) {
    const { x, y, z } = V3;
    const { a, b, c } = M3;
    return V3.add(
      V3.multiply_scalar(a(m), x(v)),
      V3.multiply_scalar(b(m), y(v)),
      V3.multiply_scalar(c(m), z(v)),
    );
  }

  static multiply_matrix(m1, m2) {
    const { a, b, c, multiply_vector } = M3;
    return M3.create(
      multiply_vector(m1, a(m2)),
      multiply_vector(m1, b(m2)),
      multiply_vector(m1, c(m2)),
    );
  }

  static negate(m) {
    return M3.multiply_scalar(m, -1);
  }

  static add(m1, m2) {
    const { a, b, c } = M3;
    return M3.create(
      V3.add(a(m1), a(m2)),
      V3.add(b(m1), b(m2)),
      V3.add(c(m1), c(m2)),
    );
  }

  static subtract(m1, m2) {
    const { a, b, c } = M3;
    return M3.create(
      V3.sub(a(m1), a(m2)),
      V3.sub(b(m1), b(m2)),
      V3.sub(c(m1), c(m2)),
    );
  }

  static determinant(m) {
    const { x, y, z } = V3;
    const { a, b, c } = M3;
    return (
      x(a(m)) * (y(b(m)) * z(c(m)) - y(c(m)) * z(b(m))) +
      x(b(m)) * (y(c(m)) * z(a(m)) - y(a(m)) * z(c(m))) +
      x(c(m)) * (y(a(m)) * z(b(m)) - y(b(m)) * z(a(m)))
    );
  }

  static inverse(m) {
    const { a, b, c, divide_scalar, create } = M3;

    const v0 = V3.cross_product(b(m), c(m));
    const v1 = V3.cross_product(c(m), a(m));
    const v2 = V3.cross_product(a(m), b(m));

    const dp = V3.dot_product(v2, c(m));

    if (dp == 0) {
      throw Error("Can not invert non-invertible matrix.");
    }

    return divide_scalar(create(v0, v1, v2), dp);
  }

  static round(m) {
    const { a, b, c, create } = M3;
    return create(V3.round(a(m)), V3.round(b(m)), V3.round(c(m)));
  }

  static rot_z(m, rad) {
    r = M3.create(
      Math.cos(rad),
      -Math.sin(rad),
      0,
      Math.sin(rad),
      Math.cos(rad),
      0,
      0,
      1,
    );
  }
}

v = V3.create(1, 1, 1);
console.log(V3.normalize(v));
m = M3.create(v, v, v);
M3.clone(m);
