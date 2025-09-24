const std = @import("std");
const trading_formula = @import("trading_formula");

const Conn = myzql.conn.Conn;
const myzql = @import("myzql");

const ResultSetIter = myzql.result.ResultSetIter;
const QueryResult = myzql.result.QueryResult;
const BinaryResultRow = myzql.result.BinaryResultRow;
const TableStructs = myzql.result.TableStructs;
const ResultSet = myzql.result.ResultSet;

const PreparedStatement = myzql.result.PreparedStatement;




pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();


    var startTime = std.time.microTimestamp(); // 获取当前的毫秒时间戳

    // Setting up client
    var client = try  Conn.init(
        allocator,
        &.{
            .username = "root",   // default: "root"
            .password = "clearing@123", // default: ""
            .database = "trading_formula",   // default: ""

            // Current default value.
            // Use std.net.getAddressList if you need to look up ip based on hostname
            .address =  std.net.Address.initIp4(.{ 127, 0, 0, 1 }, 3306),
            // ...
        },
    );

    var endTime = std.time.microTimestamp(); // 再次获取当前的毫秒时间戳
    var duration = endTime - startTime; // 计算时间差
                                          startTime = endTime;

    std.debug.print("connect elapse time.{}\n", .{duration});


    defer client.deinit(allocator);

    std.debug.print("Operation failed with error: {}\n", .{client});


    const prep_res = try client.prepare(allocator, "SELECT name, age FROM trading_formula.person");
    defer prep_res.deinit(allocator);
    const prep_stmt: PreparedStatement = try prep_res.expect(.stmt);

    // This is the struct that represents the columns of a single row.
    const Person = struct {
        name: []const u8,
        age: u8,
    };

    { // Iterating over rows, scanning into struct or creating struct
        const query_res = try client.executeRows(allocator,&prep_stmt, .{}); // no parameters because there's no ? in the query
        const new_rows: ResultSet(BinaryResultRow) = try query_res.expect(.rows);
        const rows_iter = new_rows.iter();
        while (try rows_iter.next()) |row| {
            { // Option 1: scanning into preallocated person
                var person: Person = undefined;
                try row.scan(&person);


                std.debug.print("--------------person.age: {}\n", .{person.age});


                // Important: if any field is a string, it will be valid until the next row is scanned
               // or next query. If your rows return have strings and you want to keep the data longer,
               // use the method below instead.
            }
            { // Option 2: passing in allocator to create person
                const person_ptr = try row.structCreate(Person, allocator);
                std.debug.print("----------9999----person.age: {}\n", .{person_ptr.age});

                // Important: please use BinaryResultRow.structDestroy
                // to destroy the struct created by BinaryResultRow.structCreate
                // if your struct contains strings.
                // person is valid until BinaryResultRow.structDestroy is called.
                defer BinaryResultRow.structDestroy(person_ptr, allocator);
             }
        }
    }

      endTime = std.time.microTimestamp(); // 再次获取当前的毫秒时间戳
      duration = endTime - startTime; // 计算时间差
      startTime = endTime;

    std.debug.print("query elapse time.{}.\n", .{duration});

    { // collect all rows into a table ([]const Person)
        const query_res = try client.executeRows(allocator,&prep_stmt, .{}); // no parameters because there's no ? in the query
        const new_rows: ResultSet(BinaryResultRow) = try query_res.expect(.rows);
        const rows_iter = new_rows.iter();
        var person_structs = try rows_iter.tableStructs(Person, allocator);
        defer person_structs.deinit(allocator); // data is valid until deinit is called
        std.debug.print("pppppppppppppppppp: {any}\n", .{person_structs.struct_list.items});
    }


    endTime = std.time.microTimestamp(); // 再次获取当前的毫秒时间戳
      duration = endTime - startTime; // 计算时间差
                                          startTime = endTime;

    std.debug.print("query again elapse time.{}.\n", .{duration});

}

