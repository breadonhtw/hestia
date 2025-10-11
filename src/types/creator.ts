export interface Creator {
  id: string;
  name: string;
  craftType: string;
  location: string;
  bio: string;
  image: string;
  works: Work[];
  featured?: boolean;
  story?: string;
  website?: string;
  instagram?: string;
  email?: string;
  username?: string;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}
