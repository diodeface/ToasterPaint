# ToasterPaint

Painting program for MAX7219 based displays used in protogen helmets.<br>
Allows loading and exporting bitmaps in hex:<br>
```c
Bitmap joy[16] {0x00, 0x01, 0x07, 0x0f, 0x1f, 0x38, 0x20, 0x00, 0x00, 0xc0, 0xf0, 0xf8, 0xf8, 0x1c, 0x04, 0x00};
```
or binary format:<br>
```c
Bitmap neutral[16] {
    0b00000000,
    0b00000001,
    0b00000111,
    0b00001111,
    0b00011111,
    0b00111000,
    0b00100000,
    0b00000000,
    0b00000000,
    0b11000000,
    0b11110000,
    0b11111000,
    0b11111000,
    0b00011100,
    0b00000100,
    0b00000000
};
```

![Preview](screenshot.png)

Made for use with [ToasterBlaster](https://github.com/diodeface/ToasterBlaster).

# License
This program is licensed under [GNU Affero General Public License v3.0](LICENSE).