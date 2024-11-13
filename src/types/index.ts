export type Config = {
  version: string;
  rootId: string;
  apiUrl: string;
  ajaxUrl: string;
  ajaxNonce: string;
  restUrl: string;
  restNonce: string;
  stripePublicKey: string;
};

export type Settings = {
  apiKey: string;
};

export type Image = {
  id: number;
  date: string;
  modified: string;
  title: {
    rendered: string;
  };
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  source_url: string;
  media_details: {
    filesize: number;
    width: number;
    height: number;
    file: string;
  };
  mime_type: string;
  featured_media: boolean;
  _embedded: {
    author: Array<{
      name: string;
    }>;
  };
};
