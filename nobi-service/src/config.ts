export interface Config {
  port: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3001", 10),
};

export default config;
