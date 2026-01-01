using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowMarket.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AppUsers_BuyerId",
                table: "Orders");

            migrationBuilder.AlterColumn<Guid>(
                name: "BuyerId",
                table: "Orders",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "UserAddress",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserPhone",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AppUsers_BuyerId",
                table: "Orders",
                column: "BuyerId",
                principalTable: "AppUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AppUsers_BuyerId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UserAddress",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UserPhone",
                table: "Orders");

            migrationBuilder.AlterColumn<Guid>(
                name: "BuyerId",
                table: "Orders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AppUsers_BuyerId",
                table: "Orders",
                column: "BuyerId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
