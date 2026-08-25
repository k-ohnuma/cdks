export type CreateVsnipInput = {
  title: string;
  prefix: string;
  body: string;
  description: string;
};

export type Vsnip = Record<
  string,
  {
    prefix: string;
    body: string[];
    description: string;
  }
>;
