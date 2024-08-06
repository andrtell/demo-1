class Vector3D {
  static ux = [1, 0, 0];
  static uy = [0, 1, 0];
  static uz = [0, 0, 1];

  static make(x, y, z) {
    return [x, y, z];
  }

  static clone(v) {
    return [...v];
  }

  static equal(a, b) {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
  }

  static multiply_scalar(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  }

  static divide_scalar(v, s) {
    return [v[0] / s, v[1] / s, v[2] / 2];
  }

  static negate(v) {
    return [-v[0], -v[1], -v[2]];
  }

  static add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  static subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  static magnitude(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  static normalize(v) {
    return Vector3D.divide_scalar(v, Vector3D.magnitude(v));
  }

  static dot_product(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  static cross_product(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  static project(a, b) {
    const { multiply_scalar, dot_product } = Vector3D;
    return multiply_scalar(b, dot_product(a, b) / dot_product(b, b));
  }

  static reject(a, b) {
    return Vector3D.subtract(a, Vector3D.project(a, b));
  }

  static round(v) {
    return [Math.round(v[0]), Math.round(v[1]), Math.round(v[2])];
  }
}

class Matrix3D {
  static id = [Vector3D.ux, Vector3D.uy, Vector3D.uz];

  /* Components are given as 3 row vectors (row-major) */
  static make(a, b, c) {
    /* Components are stored as 3 column vectors  (column-major) */
    return [
      [a[0], b[0], c[0]],
      [a[1], b[1], c[1]],
      [a[2], b[2], c[2]],
    ];
  }

  static make_rotation_x(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return Matrix3D.make([1, 0, 0], [0, c, -s], [0, s, c]);
  }

  static make_rotation_y(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return Matrix3D.make([c, 0, s], [0, 1, 0], [-s, 0, c]);
  }

  static make_rotation_z(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return Matrix3D.make([c, -s, 0], [s, c, 0], [0, 1, 0]);
  }

  static equal(a, b) {
    return (
      Vector3D.equal(a[0], b[0]) &&
      Vector3D.equal(a[1], b[1]) &&
      Vector3D.equal(a[2], b[2])
    );
  }

  static clone(m) {
    return Matrix3D.make([...m[0]], [...m[1]], [...m[2]]);
  }

  static multiply_scalar(m, s) {
    return [
      Vector3D.multiply_scalar(m[0], s),
      Vector3D.multiply_scalar(m[1], s),
      Vector3D.multiply_scalar(m[2], s),
    ];
  }

  static divide_scalar(m, s) {
    return Matrix3D.multiply_scalar(m, 1 / s);
  }

  static multiply_vector(m, v) {
    return Vector3D.add(
      Vector3D.multiply_scalar(m[0], v[0]),
      Vector3D.multiply_scalar(m[1], v[1]),
      Vector3D.multiply_scalar(m[2], v[2]),
    );
  }

  static multiply_matrix(m1, m2) {
    const { a, b, c, multiply_vector } = Matrix3D;
    return Matrix3D.make(
      multiply_vector(m1, a(m2)),
      multiply_vector(m1, b(m2)),
      multiply_vector(m1, c(m2)),
    );
  }

  static negate(m) {
    return Matrix3D.multiply_scalar(m, -1);
  }

  static add(m1, m2) {
    const { a, b, c } = Matrix3D;
    return Matrix3D.make(
      Vector3D.add(a(m1), a(m2)),
      Vector3D.add(b(m1), b(m2)),
      Vector3D.add(c(m1), c(m2)),
    );
  }

  static subtract(m1, m2) {
    const { a, b, c } = Matrix3D;
    return Matrix3D.make(
      Vector3D.sub(a(m1), a(m2)),
      Vector3D.sub(b(m1), b(m2)),
      Vector3D.sub(c(m1), c(m2)),
    );
  }

  static determinant(m) {
    const { x, y, z } = Vector3D;
    const { a, b, c } = Matrix3D;
    return (
      x(a(m)) * (y(b(m)) * z(c(m)) - y(c(m)) * z(b(m))) +
      x(b(m)) * (y(c(m)) * z(a(m)) - y(a(m)) * z(c(m))) +
      x(c(m)) * (y(a(m)) * z(b(m)) - y(b(m)) * z(a(m)))
    );
  }

  static inverse(m) {
    const { a, b, c, divide_scalar, make } = Matrix3D;

    const v0 = Vector3D.cross_product(b(m), c(m));
    const v1 = Vector3D.cross_product(c(m), a(m));
    const v2 = Vector3D.cross_product(a(m), b(m));

    const dot_product = Vector3D.dot_product(v2, c(m));

    if (dot_product == 0) {
      throw Error("Can not invert non-invertible matrix.");
    }

    return divide_scalar(make(v0, v1, v2), dot_product);
  }

  static round(m) {
    const { a, b, c, make } = Matrix3D;
    return make(
      Vector3D.round(a(m)),
      Vector3D.round(b(m)),
      Vector3D.round(c(m)),
    );
  }

  static rot_z(m, rad) {
    r = Matrix3D.make(
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

v = Vector3D.make(1, 1, 1);
console.log(Vector3D.clone(v));
console.log(Vector3D.normalize(v));
m = Matrix3D.make(v, v, v);
Matrix3D.clone(m);
