/**
 * Transformer для обработки Swagger спецификации перед генерацией orval
 * Удаляет лишние поля и нормализует данные
 */
module.exports = (spec) => {
  // Проходим по всем путям
  if (spec.paths) {
    Object.keys(spec.paths).forEach((path) => {
      Object.keys(spec.paths[path]).forEach((method) => {
        const operation = spec.paths[path][method];

        // Удаляем security из операций, если не нужен
        // if (operation.security) {
        //   delete operation.security;
        // }

        // Нормализуем responses
        if (operation.responses) {
          Object.keys(operation.responses).forEach((status) => {
            const response = operation.responses[status];
            if (response.content) {
              // Оставляем только application/json
              const jsonContent = response.content['application/json'];
              if (jsonContent) {
                response.content = {
                  'application/json': jsonContent,
                };
              }
            }
          });
        }
      });
    });
  }

  return spec;
};
