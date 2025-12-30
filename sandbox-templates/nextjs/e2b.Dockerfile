# You can use most Debian-based base images
FROM node:22-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

#WORKDIR /home/user/nextjs-app
WORKDIR /home/user/nextjs-app

# We provide all the flags to make the command non-interactive, which is required for Docker builds.
RUN npx --yes create-next-app@15.3.3 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-e2e

# Listar archivos para depuración
RUN ls -l /home/user/nextjs-app

# Crear tsconfig.json mínimo si no existe
RUN if [ ! -f tsconfig.json ]; then \
  echo '{\n  "compilerOptions": {\n    "target": "esnext",\n    "module": "esnext",\n    "jsx": "preserve",\n    "moduleResolution": "node",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],\n  "exclude": ["node_modules"]\n}' > tsconfig.json; \
fi

RUN echo '{ \
  "$schema": "https://ui.shadcn.com/schema.json", \
  "style": "default", \
  "rsc": true, \
  "tsx": true, \
  "tailwind": { \
    "config": "tailwind.config.ts", \
    "css": "src/app/globals.css", \
    "baseColor": "neutral", \
    "cssVariables": true \
  }, \
  "aliases": { \
    "components": "@/components", \
    "utils": "@/lib/utils" \
  } \
}' > components.json


RUN npx --yes shadcn@latest add --all --yes

# Move the Nextjs app to the home directory and remove the nextjs-app directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

WORKDIR /home/user

EXPOSE 3000

CMD ["/compile_page.sh"]