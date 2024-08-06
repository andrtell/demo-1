class Vector3D {
  static ux = [1, 0, 0];
  static uy = [0, 1, 0];
  static uz = [0, 0, 1];

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
    return [v[0] / s, v[1] / s, v[2] / s];
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

  static from_rows(a, b, c) {
    return [
      [a[0], b[0], c[0]],
      [a[1], b[1], c[1]],
      [a[2], b[2], c[2]],
    ];
  }

  static make_rotation_x(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [1, 0, 0],
      [0, c, s],
      [0, -s, c],
    ];
  }

  static make_rotation_y(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [c, 0, -s],
      [0, 1, 0],
      [s, 0, c],
    ];
  }

  static make_rotation_z(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [c, s, 0],
      [-s, c, 0],
      [0, 0, 1],
    ];
  }

  static clone(m) {
    return [[...m[0]], [...m[1]], [...m[2]]];
  }

  static equal(a, b) {
    return (
      Vector3D.equal(a[0], b[0]) &&
      Vector3D.equal(a[1], b[1]) &&
      Vector3D.equal(a[2], b[2])
    );
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

  static multiply_matrix(a, b) {
    const { multiply_vector } = Matrix3D;
    return [
      multiply_vector(a, b[0]),
      multiply_vector(a, b[1]),
      multiply_vector(a, b[2]),
    ];
  }

  static negate(m) {
    return Matrix3D.multiply_scalar(m, -1);
  }

  static add(a, b) {
    return [
      Vector3D.add(a[0], b[0]),
      Vector3D.add(a[1], b[1]),
      Vector3D.add(a[2], b[2]),
    ];
  }

  static subtract(a, b) {
    return [
      Vector3D.subtract(a[0], b[0]),
      Vector3D.subtract(a[1], b[1]),
      Vector3D.subtract(a[2], b[2]),
    ];
  }

  static determinant(m) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) +
      m[1][0] * (m[2][1] * m[0][2] - m[0][1] * m[2][2]) +
      m[2][0] * (m[0][1] * m[1][2] - m[1][1] * m[0][2])
    );
  }

  static inverse(m) {
    const v0 = Vector3D.cross_product(m[1], m[2]);
    const v1 = Vector3D.cross_product(m[2], m[0]);
    const v2 = Vector3D.cross_product(m[0], m[1]);
    const determinant = Vector3D.dot_product(v2, m[2]);
    if (determinant == 0) {
      throw Error("Can not invert non-invertible matrix.");
    }
    return Matrix3D.divide_scalar(Matrix3D.from_rows(v0, v1, v2), determinant);
  }

  static round(m) {
    return [Vector3D.round(m[0]), Vector3D.round(m[1]), Vector3D.round(m[2])];
  }
}

v = Matrix3D.from_rows([1, 0, 0], [0, 1, 0], [0, 0, 1]);
console.log(Matrix3D.inverse(v));
