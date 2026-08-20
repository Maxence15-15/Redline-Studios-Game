export interface Game {
  id: string;
  name: string;
  version: string;
  description: string;
  coverUrl?: string;
  screenshots?: string[];
  downloadUrl: string;
  sha256?: string;
  sizeMb: number;
  exePath?: string;
}

export interface Manifest {
  games: Game[];
}
