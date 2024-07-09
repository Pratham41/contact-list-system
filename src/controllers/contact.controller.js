const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const client = require("../config/db");
const { createObjectCsvWriter } = require("csv-writer");
const cloudinary = require('../config/cloudinary')

const parsePhoneNumbers = (phoneNumbers) => {
  if (typeof phoneNumbers === "string") {
    try {
      return JSON.parse(phoneNumbers);
    } catch (error) {
      throw new Error("Invalid phoneNumbers format");
    }
  }
  return phoneNumbers;
};

const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
              reject(error);
          } else {
              resolve(result);
          }
      }).end(buffer);
  });
};

const createNewContact = async (req, res, next) => {
  const { name, phoneNumbers } = req.body;
  let parsedPhoneNumbers;

  try {
    parsedPhoneNumbers = parsePhoneNumbers(phoneNumbers);
  } catch (error) {
    return next(error);
  }

  let imageUrl = null;

  try {
    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 90 })
        .toBuffer();

      const data = await uploadToCloudinary(optimizedImageBuffer);
      imageUrl = data.secure_url;
    }

    const contact = await client.contact.create({
      data: {
        name,
        image: imageUrl,
        phoneNumbers: {
          create: parsedPhoneNumbers.map((number) => ({ number })),
        },
      },
    });
    res.status(201).json(contact);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await client.contact.findMany({
      include: {
        phoneNumbers: true,
      },
    });
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

const searchForContacts = async (req, res) => {
  const { query } = req.query;

  try {
    const contactsByName = await client.contact.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        phoneNumbers: true,
      },
    });

    const phoneNumbers = await client.phoneNumber.findMany({
      where: {
        number: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        contact: true,
      },
    });

    const contacts = [
      ...contactsByName,
      ...phoneNumbers.map((pn) => pn.contact),
    ];
    const uniqueContacts = Array.from(
      new Set(contacts.map((contact) => contact.id))
    ).map((id) => contacts.find((contact) => contact.id === id));

    res.status(200).json(uniqueContacts);
  } catch (error) {
    next(error);
  }
};

const getContact = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await client.contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        phoneNumbers: true,
      },
    });

    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { name, phoneNumbers: updatedPhoneNumbers } = req.body;
  let parsedPhoneNumbers;

  try {
    parsedPhoneNumbers = parsePhoneNumbers(updatedPhoneNumbers);
  } catch (error) {
    return next(error);
  }

  let imageUrl = null;

  try {
    const contact = await client.contact.findUnique({
      where: { id: parseInt(id) },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 90 })
        .toBuffer();

      const data = await uploadToCloudinary(optimizedImageBuffer);
      imageUrl = data.secure_url;
    } else {
      imageUrl = contact.image;
    }

    let updatedContactData = {
      name: name || contact.name,
      image: imageUrl || contact.image,
    };

    if (parsedPhoneNumbers && parsedPhoneNumbers.length > 0) {
      await client.phoneNumber.deleteMany({
        where: { contactId: parseInt(id) },
      });
      const phoneNumbersData = parsedPhoneNumbers.map((number) => ({
        number,
        contactId: parseInt(id),
      }));
      await client.phoneNumber.createMany({
        data: phoneNumbersData,
      });
    }

    const updatedContact = await client.contact.update({
      where: { id: parseInt(id) },
      data: updatedContactData,
    });

    res.status(200).json({
      message: 'Contact updated successfully',
      contact: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const contact = await client.contact.delete({
      where: { id: parseInt(id) },
    });
    res
      .status(204)
      .json({ message: "Contact deleted successfully", contact: contact });
  } catch (error) {
    next(error);
  }
};

const exportContactsToCSV = async (req, res, next) => {
  try {
    const contacts = await client.contact.findMany({
      include: {
        phoneNumbers: true,
      },
    });

    if (!contacts) {
      throw new Error("No contacts found");
    }

    const csvWriter = createObjectCsvWriter({
      path: "contacts.csv",
      header: [
        { id: "id", title: "ID" },
        { id: "name", title: "Name" },
        { id: "phoneNumbers", title: "Phone Numbers" },
      ],
    });

    const records = contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      phoneNumbers: contact.phoneNumbers.map((pn) => pn.number).join(", "),
    }));

    await csvWriter.writeRecords(records);
    const filePath = path.resolve("contacts.csv");
    res.download(filePath, "contacts.csv", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        next(err);
      } else {
        console.log("File downloaded successfully");
      }
    });
  } catch (error) {
    console.error("Error exporting contacts to CSV:", error);
    next(error);
  }
};

const CONTACT_CONTROLLER = {
  createNewContact,
  searchForContacts,
  deleteContact,
  updateContact,
  getAllContacts,
  getContact,
  exportContactsToCSV,
};

module.exports = CONTACT_CONTROLLER;
