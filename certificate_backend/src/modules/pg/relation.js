module.exports = async (db) => {
   
    // await db.guides.hasMany(db.certificates, {
    //     foreignKey: {
    //         name: "guide_id"
    //     },
    //     as: "certificates"
    // })


    // Quarter -> TestTopic relation
    await db.quarters.hasMany(db.testTopics, {
        foreignKey: {
            name: "quarter_id"
        }
    })

    await db.testTopics.belongsTo(db.quarters, {
        foreignKey: {
            name: "quarter_id"
        }
    })

    await db.testTopics.hasMany(db.testQuestions, {
        foreignKey: {
            name: "test_topic_id",
            allowNull: false
        }
    })

    await db.testQuestions.belongsTo(db.testTopics, {
        foreignKey: {
            name: "test_topic_id",
            allowNull: false
        }
    })

    await db.users.hasMany(db.testAnswers, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })

    await db.testAnswers.belongsTo(db.users, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })


    await db.testTopics.hasMany(db.testAnswers, {
        foreignKey: {
            name: "test_topic_id"
        }
    })
    
    await db.testAnswers.belongsTo(db.testTopics, {
        foreignKey: {
            name: "test_topic_id"
        }
    })

    await db.users.hasMany(db.applications, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })

    await db.applications.belongsTo(db.users, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })

    await db.regions.hasMany(db.organizations, {
        foreignKey: {
            name: "region_id"
        }
    })

    await db.organizations.belongsTo(db.regions, {
        foreignKey: {
            name: "region_id"
        }
    })
    

    await db.users.hasOne(db.sessions, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })

    await db.sessions.belongsTo(db.users, {
        foreignKey: {
            name: "user_id",
            allowNull: false
        }
    })

     db.users.hasMany(db.certificates,{
        foreignKey:{
            name:'user_id'
        }
     })

     db.certificates.belongsTo(db.users,{
        foreignKey:{
            name:'user_id'
        }
     })
   
     db.regions.hasMany(db.applications,{
        foreignKey: {
             name: "region_id"
         }
      })
      
      db.applications.belongsTo(db.regions,{
         foreignKey: {
             name: "region_id"
         }
      })

       db.organizations.hasMany(db.applications,{
        foreignKey: {
             name: "organization_id"
         },
      })
      
      db.applications.belongsTo(db.organizations,{
         foreignKey: {
             name: "organization_id"
         }
      })

      db.regions.hasMany(db.certificates,{
        foreignKey: {
             name: "region_id"
         }
      })
      
      db.certificates.belongsTo(db.regions,{
         foreignKey: {
             name: "region_id"
         }
      })

       db.organizations.hasMany(db.certificates,{
        foreignKey: {
             name: "organization_id"
         },
      })
      
      db.certificates.belongsTo(db.organizations,{
         foreignKey: {
             name: "organization_id"
         }
      })
      
      db.applications.hasOne(db.certificates,{
        foreignKey:{
            name:"application_id"
        }
      })

      db.certificates.belongsTo(db.applications,{
          foreignKey:{
            name:"application_id"
          }
      })

      // Quarter relations
      db.quarters.hasMany(db.certificates, {
          foreignKey: {
              name: "quarter_id"
          }
      })

      db.certificates.belongsTo(db.quarters, {
          foreignKey: {
              name: "quarter_id"
          }
      })

      db.quarters.hasMany(db.applications, {
          foreignKey: {
              name: "quarter_id"
          }
      })

      db.applications.belongsTo(db.quarters, {
          foreignKey: {
              name: "quarter_id"
          }
      })

      
}