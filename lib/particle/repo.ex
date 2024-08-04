defmodule Particle.Repo do
  use Ecto.Repo,
    otp_app: :particle,
    adapter: Ecto.Adapters.SQLite3
end
