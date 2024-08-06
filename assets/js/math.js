class Vector3D {
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
    const { create, x, y, z } = Vector3D;
    return create(x(v), y(v), z(v));
  }

  static equal(a, b) {
    const { x, y, z } = Vector3D;
    return x(a) == x(b) && y(a) == y(b) && z(a) == z(b);
  }

  static multiply_scalar(v, s) {
    const { create, x, y, z } = Vector3D;
    return create(x(v) * s, y(v) * s, z(v) * s);
  }

  static divide_scalar(v, s) {
    return Vector3D.multiply_scalar(v, 1 / s);
  }

  static negate(v) {
    return Vector3D.multiply_scalar(v, -1);
  }

  static add(v1, v2) {
    const { x, y, z, create } = Vector3D;
    return create(x(v1) + x(v2), y(v1) + y(v2), z(v1) + z(v2));
  }

  static subtract(v1, v2) {
    const { x, y, z, create } = Vector3D;
    return create(x(v1) - x(v2), y(v1) - y(v2), z(v1) - z(v2));
  }

  static magnitude(v) {
    const { x, y, z } = Vector3D;
    return Math.sqrt(x(v) * x(v) + y(v) * y(v) + z(v) * z(v));
  }

  static normalize(v) {
    const { divide_scalar, magnitude } = Vector3D;
    return divide_scalar(v, magnitude(v));
  }

  static dot_product(a, b) {
    const { x, y, z } = Vector3D;
    return x(a) * x(b) + y(a) * y(b) + z(a) * z(b);
  }

  static cross_product(a, b) {
    const { create, x, y, z } = Vector3D;
    return create(
      y(a) * z(b) - z(a) * y(b),
      z(a) * x(b) - x(a) * z(b),
      x(a) * y(b) - y(a) * x(b),
    );
  }

  static project(a, b) {
    const { multiply_scalar, dot_product } = Vector3D;
    return multiply_scalar(b, dot_product(a, b) / dot_product(b, b));
  }

  static reject(a, b) {
    const { subtract, project } = Vector3D;
    return subtract(a, project(a, b));
  }

  static round(v) {
    const { create, x, y, z } = Vector3D;
    return create(Math.round(x(v)), Math.round(y(v)), Math.round(z(v)));
  }
}

class Matrix3x3 {
  static id = [Vector3D.ux, Vector3D.uy, Vector3D.uz];

  /* Components are given as 3 row vectors (row-major) */
  static create(a, b, c) {
    /* Components are stored as 3 column vectors  (column-major) */
    const { x, y, z } = Vector3D;
    return [
      Vector3D.create(x(a), x(b), x(c)),
      Vector3D.create(y(a), y(b), y(c)),
      Vector3D.create(z(a), z(b), z(c)),
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
    const { a, b, c } = Matrix3x3;
    return (
      Vector3D.equal(a(m1), a(m2)) &&
      Vector3D.equal(b(m1), b(m2)) &&
      Vector3D.equal(c(m1), c(m2))
    );
  }

  static clone(m) {
    const { a, b, c, create } = Matrix3x3;
    return create(
      Vector3D.clone(a(m)),
      Vector3D.clone(b(m)),
      Vector3D.clone(c(m)),
    );
  }

  static multiply_scalar(m, s) {
    const { a, b, c, create } = Matrix3x3;
    return create(
      Vector3D.multiply_scalar(a(m), s),
      Vector3D.multiply_scalar(b(m), s),
      Vector3D.multiply_scalar(c(m), s),
    );
  }

  static divide_scalar(m, s) {
    return Matrix3x3.multiply_scalar(m, 1 / s);
  }

  static multiply_vector(m, v) {
    const { x, y, z } = Vector3D;
    const { a, b, c } = Matrix3x3;
    return Vector3D.add(
      Vector3D.multiply_scalar(a(m), x(v)),
      Vector3D.multiply_scalar(b(m), y(v)),
      Vector3D.multiply_scalar(c(m), z(v)),
    );
  }

  static multiply_matrix(m1, m2) {
    const { a, b, c, multiply_vector } = Matrix3x3;
    return Matrix3x3.create(
      multiply_vector(m1, a(m2)),
      multiply_vector(m1, b(m2)),
      multiply_vector(m1, c(m2)),
    );
  }

  static negate(m) {
    return Matrix3x3.multiply_scalar(m, -1);
  }

  static add(m1, m2) {
    const { a, b, c } = Matrix3x3;
    return Matrix3x3.create(
      Vector3D.add(a(m1), a(m2)),
      Vector3D.add(b(m1), b(m2)),
      Vector3D.add(c(m1), c(m2)),
    );
  }

  static subtract(m1, m2) {
    const { a, b, c } = Matrix3x3;
    return Matrix3x3.create(
      Vector3D.sub(a(m1), a(m2)),
      Vector3D.sub(b(m1), b(m2)),
      Vector3D.sub(c(m1), c(m2)),
    );
  }

  static determinant(m) {
    const { x, y, z } = Vector3D;
    const { a, b, c } = Matrix3x3;
    return (
      x(a(m)) * (y(b(m)) * z(c(m)) - y(c(m)) * z(b(m))) +
      x(b(m)) * (y(c(m)) * z(a(m)) - y(a(m)) * z(c(m))) +
      x(c(m)) * (y(a(m)) * z(b(m)) - y(b(m)) * z(a(m)))
    );
  }

  static inverse(m) {
    const { a, b, c, divide_scalar, create } = Matrix3x3;

    const v0 = Vector3D.cross_product(b(m), c(m));
    const v1 = Vector3D.cross_product(c(m), a(m));
    const v2 = Vector3D.cross_product(a(m), b(m));

    const dot_product = Vector3D.dot_product(v2, c(m));

    if (dot_product == 0) {
      throw Error("Can not invert non-invertible matrix.");
    }

    return divide_scalar(create(v0, v1, v2), dot_product);
  }

  static round(m) {
    const { a, b, c, create } = Matrix3x3;
    return create(
      Vector3D.round(a(m)),
      Vector3D.round(b(m)),
      Vector3D.round(c(m)),
    );
  }

  static rot_z(m, rad) {
    r = Matrix3x3.create(
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

v = Vector3D.create(1, 1, 1);
console.log(Vector3D.normalize(v));
m = Matrix3x3.create(v, v, v);
Matrix3x3.clone(m);
