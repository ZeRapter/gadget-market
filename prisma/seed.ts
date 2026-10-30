import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Функция для генерации слагов (чтобы база не ругалась на уникальность)
function generateSlug(name: string) {
  const translitMap: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  }
  const translit = name.toLowerCase().split('').map(c => translitMap[c] || c).join('').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${translit}-${Date.now().toString().slice(-4)}`
}

const genres = [
  "Экшен", "RPG", "Шутеры", "Гонки", "Спорт и симуляторы", 
  "Хорроры", "Приключения", "Стратегии", "Файтинги"
]

const categoriesData = [
  {
    name: "Аксессуары для приставок",
    children: [
      { name: "Microsoft Xbox", children: [{ name: "Xbox One поколение" }, { name: "Xbox Series поколение" }] },
      { name: "Nintendo Switch" },
      { name: "Sony PlayStation", children: [{ name: "Playstation 3" }, { name: "Playstation 4" }, { name: "Playstation 5" }] },
      { name: "Steam Deck" },
      { name: "Аксессуары JYS" }
    ]
  },
  { name: "Брелки" },
  {
    name: "Геймпады",
    children: [
      { name: "Геймпады PS3" },
      { name: "Геймпады PS4", children: [{ name: "Геймпады PS4 новые" }, { name: "Геймпады PS4 б/у" }] },
      { name: "Геймпады PS5", children: [{ name: "Геймпады PS5 новые" }, { name: "Геймпады PS5 б/у" }] },
      { name: "Геймпад Switch", children: [{ name: "Геймпады Switch новые" }, { name: "Геймпады Switch б/у" }] },
      { name: "Геймпад Xbox", children: [{ name: "Геймпады Xbox 360" }, { name: "Геймпады Xbox One/Series новые" }, { name: "Геймпады Xbox One/Series б/у" }] },
      { name: "Геймпады Прочие" }
    ]
  },
  { name: "Держатель геймпада" },
  {
    name: "Диски/Картриджы",
    children: [
      { name: "Nintendo Switch" },
      { name: "Nintendo Switch 2" },
      { name: "Nintendo Switch б/у" },
      { name: "PS3", children: genres.map(g => ({ name: g })) },
      { name: "PS4 новые", children: genres.map(g => ({ name: g })) },
      { name: "PS4 б/у", children: genres.map(g => ({ name: g })) },
      { name: "PS5 новые", children: genres.map(g => ({ name: g })) },
      { name: "PS5 б/у", children: genres.map(g => ({ name: g })) },
      { name: "PSP" },
      { name: "PS Vita" },
      { name: "Xbox 360", children: genres.map(g => ({ name: g })) },
      { name: "Xbox One/Series", children: genres.map(g => ({ name: g })) }
    ]
  },
  { name: "Игровые рули" },
  {
    name: "Накопители памяти",
    children: [{ name: "SSD M.2 для PS5" }, { name: "Micro SD" }]
  },
  { name: "Настольные светильники" },
  { name: "Наушники" },
  { name: "Ноутбуки и Компьютеры" },
  { name: "Планшеты" },
  { name: "Рем. комплект" },
  { name: "Телефоны" },
  {
    name: "Фигурки",
    children: [
      { name: "Игрушки в машину" },
      { name: "Фигурки Funko POP" },
      { name: "Фигурки IRON Studios" },
      { name: "Фигурки NECA" },
      { name: "Фигурки Супергерои 30см" }
    ]
  }
]

async function createCategory(name: string, parentId: string | null = null) {
  // Проверяем, существует ли уже такая категория с таким же родителем
  const existing = await prisma.category.findFirst({
    where: { name, parentId }
  })
  
  if (existing) return existing

  return await prisma.category.create({
    data: {
      name,
      slug: generateSlug(name),
      parentId
    }
  })
}

async function seedCategories(categories: any[], parentId: string | null = null) {
  for (const cat of categories) {
    const createdCat = await createCategory(cat.name, parentId)
    if (cat.children && cat.children.length > 0) {
      await seedCategories(cat.children, createdCat.id)
    }
  }
}

async function main() {
  console.log('🚀 Начинаем заполнение каталога...')
  
  // ВАЖНО: Если ты хочешь начать с нуля и удалить старые тестовые категории,
  // раскомментируй строку ниже. Она удалит ВСЕ категории перед заливкой.
  // await prisma.category.deleteMany() 

  await seedCategories(categoriesData)
  console.log('✅ Каталог успешно заполнен!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })