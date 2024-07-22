const {
    client,
    createProduct,
    createTables,
    createUser,
    createFavorite,
    destroyFavorite,
  } = require("./db");
  
  const init = async () => {
    await client.connect();
  
    await createTables();
    
    const [mark, bob, wade] = await Promise.all([
      createUser({ name: "mark", password: "mark123" }),
      createUser({ name: "bob", password: "bob123" }),
      createUser({ name: "wade", password: "wade123" }),
    ]);
 
    const [cleats, helmet, visor] = await Promise.all([
      createProduct({ name: "cleats" }),
      createProduct({ name: "helmet" }),
      createProduct({ name: "visor" }),
    ]);
  
    const [fav1, fav2, fav3] = await Promise.all([
      createFavorite({ user_id: mark.id, product_id: cleats.id }),
      createFavorite({ user_id: bob.id, product_id: helmet.id }),
      createFavorite({ user_id: wade.id, product_id: visor.id }),
    ]);
  
    await destroyFavorite({ id: fav2.id, user_id: mark.id });
  
    await client.end();
  };
  
  init();