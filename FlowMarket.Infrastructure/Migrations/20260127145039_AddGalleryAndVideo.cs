using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowMarket.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGalleryAndVideo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "Images",
                table: "Products",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Products",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Images",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Products");
        }
    }
}
