const bcrypt = require("bcrypt");

const adminRole = ["admin", "developer"];

function isAdminRole(userData) {
  return userData && adminRole.includes(userData.role);
}

function isDevRole(userData) {
  return userData && userData.role === "developer";
}

async function initAdmins(db) {
  const data = await db.models.Admin.findOne({
    role: "developer",
  });

  if(!data) {
    const [devHashpw, adminHashpw] = await Promise.all([
      bcrypt.hash(process.env.DEV_PASSWORD, 12),
      bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    ]);

    const promises = [
      db.models.Admin.create({
        username: process.env.DEV_USERNAME,
        hashpw: devHashpw,
        role: "developer",
      }),
      db.models.Admin.create({
        username: process.env.ADMIN_USERNAME,
        hashpw: adminHashpw,
        role: "admin",
      }),
    ];
    
    for(let i = 1; i <= 3; i++) {
      promises.push(db.models.Admin.create({
          username: `admin0${i}`,
          hashpw: adminHashpw,
          role: "admin",
        }),
      );
    }

    await Promise.all(promises);
  }
}

module.exports.isAdminRole = isAdminRole;
module.exports.isDevRole = isDevRole;
module.exports.initAdmins = initAdmins;