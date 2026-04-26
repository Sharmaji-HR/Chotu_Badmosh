const mongoose = require('mongoose');
const Part = require('../src/models/Part');
require('dotenv').config();

const sampleParts = [
  {
    name: 'Engine Block',
    category: 'Engine',
    carMake: 'Toyota',
    carModel: 'Camry',
    year: 2018,
    price: 299,
    condition: 'used',
    description: 'Rebuilt engine block from 2018 Toyota Camry',
  },
  {
    name: 'Transmission',
    category: 'Drivetrain',
    carMake: 'Honda',
    carModel: 'Civic',
    year: 2019,
    price: 450,
    condition: 'used',
    description: 'Automatic transmission from 2019 Honda Civic',
  },
  {
    name: 'Brake System',
    category: 'Brakes',
    carMake: 'Ford',
    carModel: 'Focus',
    year: 2017,
    price: 180,
    condition: 'used',
    description: 'Complete brake system including rotors and pads',
  },
  {
    name: 'Alternator',
    category: 'Electrical',
    carMake: 'BMW',
    carModel: '3 Series',
    year: 2020,
    price: 120,
    condition: 'new',
    description: 'Brand new alternator for BMW 3 Series',
  },
  {
    name: 'Radiator',
    category: 'Cooling',
    carMake: 'Mercedes-Benz',
    carModel: 'C-Class',
    year: 2016,
    price: 95,
    condition: 'used',
    description: 'Radiator from 2016 Mercedes C-Class',
  },
  {
    name: 'Starter Motor',
    category: 'Electrical',
    carMake: 'Audi',
    carModel: 'A4',
    year: 2015,
    price: 85,
    condition: 'used',
    description: 'Starter motor for Audi A4',
  },
];

const seedParts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Part.deleteMany(); // Clear existing parts
    await Part.insertMany(sampleParts);

    console.log('Sample parts added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding parts:', error);
    process.exit(1);
  }
};

seedParts();