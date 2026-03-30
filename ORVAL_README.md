# Orval - Генерация TypeScript типов из Swagger

## Настройка завершена ✅

Все сущности, DTO и контроллеры подготовлены для правильной генерации типов через **orval**.

## Что было сделано

### 1. Entity файлы (добавлен `@ApiProperty`)
- `src/users/entities/user.entity.ts`
- `src/users/entities/user-profile.entity.ts`
- `src/users/entities/user-credential.entity.ts`
- `src/users/entities/refresh-token.entity.ts`
- `src/users/entities/post.entity.ts`
- `src/users/entities/comment.entity.ts`
- `src/users/entities/postLike.entity.ts`
- `src/follower/entities/follower.entity.ts`

### 2. Response DTO (созданы новые)
- `src/auth/dto/auth-tokens.dto.ts` — токены авторизации
- `src/auth/dto/auth-response.dto.ts` — ответ авторизации
- `src/common/dto/success-message.dto.ts` — сообщение об успехе
- `src/users/dto/user-response.dto.ts` — ответы для пользователей
- `src/users/dto/post-response.dto.ts` — ответы для постов
- `src/users/dto/comment-response.dto.ts` — ответы для комментариев
- `src/follower/dto/follower-response.dto.ts` — ответы для подписок

### 3. Контроллеры (добавлен `@ApiResponse`)
- `src/auth/auth.controller.ts`
- `src/users/users.controller.ts`
- `src/follower/follower.controller.ts`

### 4. Конфигурация Orval
- `orval.config.ts` — основная конфигурация
- `orval-transformer.js` — трансформер Swagger спецификации

---

## Использование

### 1. Запустите backend сервер

```bash
npm run start:dev
```

Сервер запустится на `http://localhost:3000`

### 2. Сгенерируйте типы (из frontend проекта)

```bash
npx orval --config ../karate/orval.config.ts
```

Или добавьте в `package.json` вашего React проекта:

```json
{
  "scripts": {
    "generate:types": "orval --config ../karate/orval.config.ts"
  }
}
```

### 3. Использование сгенерированных типов в React

```typescript
import { useUsersAllUsersQuery, useAuthLoginMutation } from '@/generated/api';

// Пример использования хука React Query
function UsersList() {
  const { data: usersData } = useUsersAllUsersQuery();
  
  return (
    <div>
      {usersData?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Пример мутации
function LoginForm() {
  const loginMutation = useAuthLoginMutation();
  
  const handleSubmit = async (credentials: LoginUserDto) => {
    const response = await loginMutation.mutateAsync(credentials);
    console.log(response.data); // AuthResponseDto
  };
}
```

---

## Структура сгенерированных файлов

```
src/generated/
├── api.ts              # API client с хуками
└── model/              # TypeScript типы
    ├── auth.ts
    ├── users.ts
    ├── follower.ts
    └── index.ts
```

---

## Конфигурация orval

### Режим генерации: `tags-split`
Каждый тег Swagger (Auth, Users, Follower) генерируется в отдельный файл.

### Client: `axios`
Генерируется axios client с хуками для React Query.

### Схемы
Все DTO и Entity генерируются как TypeScript интерфейсы в папке `model/`.

---

## Примеры генерируемых типов

```typescript
// AuthResponseDto
export interface AuthResponseDto {
  user: User;
  tokens: AuthTokensDto;
}

// UsersListDto
export interface UsersListDto {
  users: User[];
  total: number;
}

// Хук для получения пользователей
export const useUsersAllUsersQuery = (
  options?: AxiosRequestConfig
): UseQueryResult<UsersListDto, AxiosError> => {
  return useQuery(['users'], fetchUsersAllUsers(options));
};
```

---

## Примечания

1. **Swagger JSON endpoint**: `http://localhost:3000/api/docs-json`
2. **Swagger UI**: `http://localhost:3000/api/docs`
3. Перед генерацией типов убедитесь, что backend запущен
4. Для обновления типов заново запустите команду генерации
